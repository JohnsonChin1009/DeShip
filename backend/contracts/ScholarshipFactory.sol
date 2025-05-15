// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

// Import the RoleNFT interface
interface IRoleNFT {
    function hasRoleNFT(address user) external view returns (bool);
    function getUserRole(address user) external view returns (string memory);
    function isCompanyRole(uint256 tokenId) external view returns (bool);
    function userTokenId(address user) external view returns (uint256);
}

contract ScholarshipFactory is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    Counters.Counter private _scholarshipIds;
    address[] public scholarships;
    mapping(address => address[]) public companyScholarships;

    // RoleNFT contract address
    IRoleNFT public roleNFT;

    event ScholarshipCreated(
        address indexed scholarshipAddress,
        address indexed company,
        string scholarshipTitle,
        uint256 totalAmount,
        uint256 scholarshipId
    );

    constructor(address initialOwner, address _roleNFTAddress) Ownable(initialOwner) {
        roleNFT = IRoleNFT(_roleNFTAddress);
    }

    function updateRoleNFTAddress(address _newRoleNFTAddress) external onlyOwner {
        require(_newRoleNFTAddress != address(0), "Invalid address");
        roleNFT = IRoleNFT(_newRoleNFTAddress);
    }

    function createScholarship(
        string memory _title,
        string memory _description,
        uint256 _gpa,
        string memory _additionalRequirements,
        uint256 _totalAmount,
        uint256 _deadline,
        string[] memory _milestoneTitles,
        uint256[] memory _milestoneAmounts
    ) public payable nonReentrant returns (address) {
        // Check if the sender has a company role using RoleNFT
        require(roleNFT.hasRoleNFT(msg.sender), "No role NFT found");
        require(keccak256(abi.encodePacked(roleNFT.getUserRole(msg.sender))) == keccak256(abi.encodePacked("Company")), "Not a company role");
        
        require(msg.value >= _totalAmount, "Insufficient funds sent");
        require(_milestoneTitles.length == _milestoneAmounts.length, "Milestone data mismatch");
        
        _scholarshipIds.increment();
        uint256 newScholarshipId = _scholarshipIds.current();

        Scholarship newScholarship = new Scholarship{value: msg.value}(
            msg.sender,
            _title,
            _description,
            _gpa,
            _additionalRequirements,
            _totalAmount,
            _deadline,
            _milestoneTitles,
            _milestoneAmounts,
            address(roleNFT)
        );

        address scholarshipAddress = address(newScholarship);
        scholarships.push(scholarshipAddress);
        companyScholarships[msg.sender].push(scholarshipAddress);

        emit ScholarshipCreated(
            scholarshipAddress,
            msg.sender,
            _title,
            _totalAmount,
            newScholarshipId
        );

        return scholarshipAddress;
    }

    function getCompanyScholarships(address _company) public view returns (address[] memory) {
        return companyScholarships[_company];
    }

    function getTotalScholarships() public view returns (uint256) {
        return scholarships.length;
    }

    function getScholarshipByIndex(uint256 _index) public view returns (address) {
        require(_index < scholarships.length, "Index out of bounds");
        return scholarships[_index];
    }

    function getAllScholarships() public view returns (address[] memory) {
        return scholarships;
    }

    receive() external payable {}
}

contract Scholarship is ReentrancyGuard, AutomationCompatibleInterface {
    using SafeMath for uint256;

    enum ScholarshipStatus { Open, InProgress, Closed, Completed }

    struct Milestone {
        string title;
        uint256 amount;
        bool isCompleted;
        bool fundsReleased;
    }

    struct Eligibility {
        uint256 gpa;
        string additionalRequirements;
    }

    struct StudentApplication {
        address studentAddress;
        bool isApproved;
        uint256 fundsWithdrawn;
        mapping(uint256 => bool) completedMilestones;
    }

    address public company;
    string public title;
    string public description;
    Eligibility public eligibility;
    uint256 public totalAmount;
    uint256 public deadline;
    ScholarshipStatus public status;

    // RoleNFT contract reference
    IRoleNFT public roleNFT;

    Milestone[] public milestones;
    mapping(address => StudentApplication) public studentApplications;
    address[] public applicants;
    address[] public approvedStudents;

    // Events
    event StudentApplied(address student);
    event StudentApproved(address student);
    event MilestoneCompleted(address student, uint256 milestoneId);
    event FundsReleased(address student, uint256 amount, uint256 milestoneId);
    event ScholarshipStatusUpdated(ScholarshipStatus status);
    event ScholarshipDetailsUpdated(
        string newTitle,
        string newDescription,
        uint256 newGpa,
        string newAdditionalRequirements,
        uint256 newDeadline
    );

    modifier onlyCompany() {
        require(msg.sender == company, "Unauthorized");
        _;
    }

    modifier isOpen() {
        require(status == ScholarshipStatus.Open, "Scholarship not open");
        _;
    }

    constructor(
        address _company,
        string memory _title,
        string memory _description,
        uint256 _gpa,
        string memory _additionalRequirements,
        uint256 _totalAmount,
        uint256 _deadline,
        string[] memory _milestoneTitles,
        uint256[] memory _milestoneAmounts,
        address _roleNFTAddress
    ) payable {
        require(_deadline > block.timestamp, "Invalid deadline");
        require(_milestoneTitles.length == _milestoneAmounts.length, "Invalid milestones");
        
        roleNFT = IRoleNFT(_roleNFTAddress);
        
        // Verify that company address has a company role
        require(roleNFT.hasRoleNFT(_company), "Company has no role NFT");
        require(keccak256(abi.encodePacked(roleNFT.getUserRole(_company))) == keccak256(abi.encodePacked("Company")), "Not a company role");
        
        uint256 totalMilestoneAmounts;
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            totalMilestoneAmounts = totalMilestoneAmounts.add(_milestoneAmounts[i]);
            milestones.push(Milestone({
                title: _milestoneTitles[i],
                amount: _milestoneAmounts[i],
                isCompleted: false,
                fundsReleased: false
            }));
        }
        require(totalMilestoneAmounts == _totalAmount, "Milestone sum mismatch");

        company = _company;
        title = _title;
        description = _description;
        totalAmount = _totalAmount;
        deadline = _deadline;
        status = ScholarshipStatus.Open;
        
        eligibility = Eligibility({
            gpa: _gpa,
            additionalRequirements: _additionalRequirements
        });
    }

    function applyForScholarship() public isOpen {
        require(block.timestamp < deadline, "Deadline passed");
        
        // Check if the sender has a student role
        require(roleNFT.hasRoleNFT(msg.sender), "No role NFT found");
        require(keccak256(abi.encodePacked(roleNFT.getUserRole(msg.sender))) == keccak256(abi.encodePacked("Student")), "Not a student role");
        
        StudentApplication storage application = studentApplications[msg.sender];
        require(application.studentAddress == address(0), "Already applied");
        
        application.studentAddress = msg.sender;
        applicants.push(msg.sender);
        emit StudentApplied(msg.sender);
    }

    function approveStudent(address _student) public onlyCompany {
        StudentApplication storage application = studentApplications[_student];
        require(application.studentAddress == _student, "Not an applicant");
        require(!application.isApproved, "Already approved");
        
        application.isApproved = true;
        approvedStudents.push(_student);
        
        if (status == ScholarshipStatus.Open) {
            status = ScholarshipStatus.InProgress;
            emit ScholarshipStatusUpdated(ScholarshipStatus.InProgress);
        }
        emit StudentApproved(_student);
    }

    function completeMilestone(address _student, uint256 _milestoneId) public onlyCompany nonReentrant {
        _completeMilestone(_student, _milestoneId);
    }

    // Internal function to complete milestone
    function _completeMilestone(address _student, uint256 _milestoneId) internal {
        require(_milestoneId < milestones.length, "Invalid milestone");
        StudentApplication storage application = studentApplications[_student];
        
        require(application.isApproved, "Student not approved");
        require(!application.completedMilestones[_milestoneId], "Milestone completed");
        require(!milestones[_milestoneId].isCompleted, "Milestone already completed");

        milestones[_milestoneId].isCompleted = true;
        application.completedMilestones[_milestoneId] = true;
        
        emit MilestoneCompleted(_student, _milestoneId);
        _updateScholarshipStatus();
    }

    
    // Internal function to release funds
    function releaseMilestoneFunds(address _student, uint256 _milestoneId) internal {
        require(_milestoneId < milestones.length, "Invalid milestone");
        StudentApplication storage application = studentApplications[_student];
        
        require(application.isApproved, "Student not approved");
        require(application.completedMilestones[_milestoneId], "Milestone not completed");
        require(milestones[_milestoneId].isCompleted, "Milestone not completed");
        require(!milestones[_milestoneId].fundsReleased, "Funds already released");
        
        uint256 amount = milestones[_milestoneId].amount;
        application.fundsWithdrawn = application.fundsWithdrawn.add(amount);
        milestones[_milestoneId].fundsReleased = true;
        
        (bool success, ) = payable(_student).call{value: amount}("");
        require(success, "Payment failed");
        
        emit FundsReleased(_student, amount, _milestoneId);
        _updateScholarshipStatus(); 
    }

    function getTotalMilestones() public view returns (uint256) {
        return milestones.length;
    }

    function getMilestone(uint256 _milestoneId) public view returns (
        string memory titleReturn,
        uint256 amount,
        bool isCompleted,
        bool fundsReleased
    ) {
        require(_milestoneId < milestones.length, "Invalid milestone ID");
        Milestone storage milestone = milestones[_milestoneId];
        return (milestone.title, milestone.amount, milestone.isCompleted, milestone.fundsReleased);
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getScholarshipStatus() public view returns (ScholarshipStatus) {
        return status;
    }

    function getApplicants() public view returns (address[] memory) {
        return applicants;
    }

    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        if (status != ScholarshipStatus.InProgress) return (false, "");

        // Check for approved students with completed milestones that need funds released
        bool[] memory studentNeedsFunds = new bool[](approvedStudents.length);
        uint256[] memory milestoneIndices = new uint256[](approvedStudents.length);
        address[] memory studentsToProcess = new address[](approvedStudents.length);
        uint256 studentsToProcessCount = 0;
        
        for (uint256 i = 0; i < approvedStudents.length; i++) {
            address student = approvedStudents[i];
            StudentApplication storage application = studentApplications[student];
            
            if (!application.isApproved) continue;
            
            for (uint256 j = 0; j < milestones.length; j++) {
                if (application.completedMilestones[j] && milestones[j].isCompleted && !milestones[j].fundsReleased) {
                    studentNeedsFunds[studentsToProcessCount] = true;
                    milestoneIndices[studentsToProcessCount] = j;
                    studentsToProcess[studentsToProcessCount] = student;
                    studentsToProcessCount++;
                    break;
                }
            }
        }
        
        if (studentsToProcessCount > 0) {
            address[] memory filteredStudents = new address[](studentsToProcessCount);
            bool[] memory filteredNeedsFunds = new bool[](studentsToProcessCount);
            uint256[] memory filteredMilestoneIndices = new uint256[](studentsToProcessCount);
            
            for (uint256 i = 0; i < studentsToProcessCount; i++) {
                filteredStudents[i] = studentsToProcess[i];
                filteredNeedsFunds[i] = studentNeedsFunds[i];
                filteredMilestoneIndices[i] = milestoneIndices[i];
            }
            
            return (true, abi.encode(filteredStudents, filteredNeedsFunds, filteredMilestoneIndices));
        }
        
        return (false, "");
    }
    
    function performUpkeep(bytes calldata performData) external override {
        (
            address[] memory students,
            bool[] memory studentNeedsFunds,
            uint256[] memory milestoneIndices
        ) = abi.decode(performData, (address[], bool[], uint256[]));
        
        require(students.length == studentNeedsFunds.length && students.length == milestoneIndices.length, "Data length mismatch");
        
        for (uint256 i = 0; i < students.length; i++) {
            if (studentNeedsFunds[i]) {
                address student = students[i];
                uint256 milestoneId = milestoneIndices[i];
                
                // Verification checks to ensure data is still valid
                StudentApplication storage application = studentApplications[student];
                if (!application.isApproved) continue;
                if (!application.completedMilestones[milestoneId]) continue;
                if (!milestones[milestoneId].isCompleted) continue;
                if (milestones[milestoneId].fundsReleased) continue;
                
                releaseMilestoneFunds(student, milestoneId);
            }
        }
    }

    // Internal functions
    function _updateScholarshipStatus() private {
        bool allCompleted = true;
        bool allFundsReleased = true;
        
        for (uint256 i = 0; i < milestones.length; i++) {
            if (!milestones[i].isCompleted) {
                allCompleted = false;
            }
            if (!milestones[i].fundsReleased && milestones[i].isCompleted) {
                allFundsReleased = false;
            }
        }
        
        if (allCompleted && allFundsReleased) {
            status = ScholarshipStatus.Completed;
            emit ScholarshipStatusUpdated(ScholarshipStatus.Completed);
        }
    }

    function updateScholarshipDetails(
        string memory _newTitle,
        string memory _newDescription,
        uint256 _newGpa,
        string memory _newAdditionalRequirements,
        uint256 _newDeadline
    ) external onlyCompany {
        require(status == ScholarshipStatus.Open, "Scholarship not open");
        require(_newDeadline > block.timestamp, "Invalid deadline");
        
        title = _newTitle;
        description = _newDescription;
        eligibility.gpa = _newGpa;
        eligibility.additionalRequirements = _newAdditionalRequirements;
        deadline = _newDeadline;

        emit ScholarshipDetailsUpdated(
            _newTitle,
            _newDescription,
            _newGpa,
            _newAdditionalRequirements,
            _newDeadline
        );
    }

    receive() external payable {}
    fallback() external payable {}
}