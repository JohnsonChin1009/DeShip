// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ScholarshipFactory is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    
    Counters.Counter private _scholarshipIds;
    address[] public scholarships;
    mapping(address => address[]) public companyScholarships;

    event ScholarshipCreated(
        address indexed scholarshipAddress,
        address indexed company,
        string scholarshipTitle,
        uint256 totalAmount,
        uint256 scholarshipId
    );

    constructor(address initialOwner) Ownable(initialOwner) {}

    function createScholarship(
        string memory _title,
        string memory _description,
        uint256 _gpa,
        string memory _additionalRequirements,  // Kept as single requirement
        uint256 _totalAmount,
        uint256 _deadline,
        string[] memory _milestoneTitles,
        uint256[] memory _milestoneAmounts
    ) public payable nonReentrant returns (address) {
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
            _milestoneAmounts
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

    // Keep rest of factory functions unchanged
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

    receive() external payable {}
}

contract Scholarship is ReentrancyGuard {
    using SafeMath for uint256;

    enum ScholarshipStatus { Open, InProgress, Closed, Completed }
    
    struct Milestone {
        string title;
        uint256 amount;
        bool isCompleted;
    }

    // Simplified Eligibility
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
    
    Milestone[] public milestones;
    mapping(address => StudentApplication) public studentApplications;
    address[] public applicants;
    address[] public approvedStudents;

    // Events (removed unused ones)
    event StudentApplied(address student);
    event StudentApproved(address student);
    event MilestoneCompleted(address student, uint256 milestoneId);
    event FundsReleased(address student, uint256 amount);
    event ScholarshipStatusUpdated(ScholarshipStatus status);

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
        uint256[] memory _milestoneAmounts
    ) payable {
        require(_deadline > block.timestamp, "Invalid deadline");
        require(_milestoneTitles.length == _milestoneAmounts.length, "Invalid milestones");
        
        uint256 totalMilestoneAmounts;
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            totalMilestoneAmounts = totalMilestoneAmounts.add(_milestoneAmounts[i]);
            milestones.push(Milestone({
                title: _milestoneTitles[i],
                amount: _milestoneAmounts[i],
                isCompleted: false
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

    // Keep core functions but remove field-of-study related code
    function applyForScholarship() public isOpen {
        require(block.timestamp < deadline, "Deadline passed");
        
        StudentApplication storage application = studentApplications[msg.sender];
        require(application.studentAddress == address(0), "Already applied");
        
        application.studentAddress = msg.sender;
        applicants.push(msg.sender);
        emit StudentApplied(msg.sender);
    }

    // Rest of core functions remain unchanged
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
        require(_milestoneId < milestones.length, "Invalid milestone");
        StudentApplication storage application = studentApplications[_student];
        
        require(application.isApproved, "Student not approved");
        require(!application.completedMilestones[_milestoneId], "Milestone completed");
        require(!milestones[_milestoneId].isCompleted, "Milestone already completed");

        milestones[_milestoneId].isCompleted = true;
        application.completedMilestones[_milestoneId] = true;
        
        uint256 amount = milestones[_milestoneId].amount;
        application.fundsWithdrawn = application.fundsWithdrawn.add(amount);
        
        (bool success, ) = payable(_student).call{value: amount}("");
        require(success, "Payment failed");
        
        emit FundsReleased(_student, amount);
        emit MilestoneCompleted(_student, _milestoneId);
        _updateScholarshipStatus();
    }

    // Keep helper functions except field-of-study related ones
    function getTotalMilestones() public view returns (uint256) {
        return milestones.length;
    }

    function getMilestone(uint256 _milestoneId) public view returns (
        string memory titleReturn,  // Fixed: Renamed to avoid shadowing
        uint256 amount,
        bool isCompleted
    ) {
        require(_milestoneId < milestones.length, "Invalid milestone ID");
        Milestone storage milestone = milestones[_milestoneId];
        return (milestone.title, milestone.amount, milestone.isCompleted);
    }

    // Remove field-of-study specific helpers
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getScholarshipStatus() public view returns (ScholarshipStatus) {
        return status;
    }

    // Rest of internal functions remain unchanged
    function _updateScholarshipStatus() private {
        bool allCompleted = true;
        for (uint256 i = 0; i < milestones.length; i++) {
            if (!milestones[i].isCompleted) {
                allCompleted = false;
                break;
            }
        }
        if (allCompleted) {
            status = ScholarshipStatus.Completed;
            emit ScholarshipStatusUpdated(ScholarshipStatus.Completed);
        }
    }

    receive() external payable {}
    fallback() external payable {}
}