// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


//Factory contract for creating and managing scholarship contracts
contract ScholarshipFactory is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    
    Counters.Counter private _scholarshipIds;

    address[] public scholarships;
    
    // Mapping company address => scholarships
    mapping(address => address[]) public companyScholarships;
    
    // Emit event when a new scholarship is created
    event ScholarshipCreated(
        address indexed scholarshipAddress,
        address indexed company,
        string companyName,
        string scholarshipTitle,
        uint256 scholarshipAmount,
        uint256 scholarshipId
    );

    //initialOwner Address of the owner (company) who will have the permission to create scholarships
    constructor(address initialOwner) Ownable(initialOwner) {
        // No need for transferOwnership as it's handled by the Ownable constructor
    }
    
    function createScholarship(
        string memory _companyName,
        string memory _scholarshipTitle,
        string memory _scholarshipDescription,
        uint256 _scholarshipAmount,
        uint256 _fundTotalAmount
    ) public payable nonReentrant returns (address) {
        // Check if the sent amount matches the fund total amount
        require(msg.value >= _scholarshipAmount, "Insufficient funds sent");
        
        // Increment scholarship ID
        _scholarshipIds.increment();
        uint256 newScholarshipId = _scholarshipIds.current();
        
        // Deploy new scholarship contract 
        Scholarship newScholarship = new Scholarship{value: msg.value}(
            msg.sender,
            _companyName,
            _scholarshipTitle,
            _scholarshipDescription,
            _scholarshipAmount,
            _fundTotalAmount,
            newScholarshipId
        );
        
        // Add scholarship to the tracking arrays and mappings
        address scholarshipAddress = address(newScholarship);
        scholarships.push(scholarshipAddress);
        companyScholarships[msg.sender].push(scholarshipAddress);
        
        emit ScholarshipCreated(
            scholarshipAddress,
            msg.sender,
            _companyName,
            _scholarshipTitle,
            _scholarshipAmount,
            newScholarshipId
        );
        
        return scholarshipAddress;
    }
    
    //to get all scholarships related to the company
    function getCompanyScholarships(address _company) public view returns (address[] memory) {
        return companyScholarships[_company];
    }
    
    //to get the total number of scholarships
    function getTotalScholarships() public view returns (uint256) {
        return scholarships.length;
    }
    
    //to get scholarship address based on index
    function getScholarshipByIndex(uint256 _index) public view returns (address) {
        require(_index < scholarships.length, "Index out of bounds");
        return scholarships[_index];
    }
    
    receive() external payable {
        // Allow the contract to receive ETH
    }
}

//Below is the Contract representing an individual scholarship (Contract template)
contract Scholarship is ReentrancyGuard {
    using SafeMath for uint256;
    
    // Scholarship status
    enum ScholarshipStatus { Open, InProgress, Closed, Completed }
    
    // Scholarship milestone
    struct Milestone {
        string description;
        bool isCompleted;
        uint256 fundPercentage;
    }
    
    // Student application structure
    struct StudentApplication {
        address studentAddress;
        bool isApproved;
        uint256 fundsWithdrawn;
        mapping(uint256 => bool) completedMilestones;
    }
    
    // Scholarship details
    address public company;
    string public companyName;
    string public scholarshipTitle;
    string public scholarshipDescription;
    uint256 public scholarshipAmount;
    uint256 public fundTotalAmount;
    uint256 public scholarshipId;
    ScholarshipStatus public scholarshipStatus;
    
    Milestone[] public milestones;
    
    // Map student addresses to their respective applications
    mapping(address => StudentApplication) public studentApplications;
    
    address[] public applicants;
    
    address[] public approvedStudents;
    
    // Total fund percentage allocated
    uint256 public totalFundPercentageAllocated;
    
    // Events
    event ScholarshipUpdated(string scholarshipTitle, string scholarshipDescription, uint256 scholarshipAmount, uint256 fundTotalAmount);
    event ScholarshipDeleted();
    event StudentRegistered(address student);
    event StudentApproved(address student);
    event StudentApplied(address student);
    event MilestoneAdded(uint256 milestoneId, string description, uint256 fundPercentage);
    event MilestoneCompleted(address student, uint256 milestoneId);
    event FundsReleasedBasedOnMilestone(address student, uint256 milestoneId, uint256 amount);
    event ScholarshipStatusUpdated(ScholarshipStatus status);
    event FundsDeposited(address from, uint256 amount);
    
    //custom modifier so that only the company can interact with the function
    modifier onlyCompany() {
        require(msg.sender == company, "Only the company can perform this action");
        _;
    }
    
    modifier scholarshipIsOpen() {
        require(scholarshipStatus == ScholarshipStatus.Open, "Scholarship is not open");
        _;
    }
    
    constructor(
        address _company,
        string memory _companyName,
        string memory _scholarshipTitle,
        string memory _scholarshipDescription,
        uint256 _scholarshipAmount,
        uint256 _fundTotalAmount,
        uint256 _scholarshipId
    ) payable {
        company = _company;
        companyName = _companyName;
        scholarshipTitle = _scholarshipTitle;
        scholarshipDescription = _scholarshipDescription;
        scholarshipAmount = _scholarshipAmount;
        fundTotalAmount = _fundTotalAmount;
        scholarshipId = _scholarshipId;
        scholarshipStatus = ScholarshipStatus.Open; // by default status is open 
        totalFundPercentageAllocated = 0;
        
        // Emit a deposit event for the initial funding
        if (msg.value > 0) {
            emit FundsDeposited(msg.sender, msg.value);
        }
    }
    
    //to update scholarship details
    function updateScholarshipDetails(
        string memory _scholarshipTitle,
        string memory _scholarshipDescription,
        uint256 _scholarshipAmount,
        uint256 _fundTotalAmount
    ) public payable onlyCompany {

        scholarshipTitle = _scholarshipTitle;
        scholarshipDescription = _scholarshipDescription;
        scholarshipAmount = _scholarshipAmount;
        fundTotalAmount = _fundTotalAmount;
        
        // Accept additional funds if sent (not sure if they update the fund, will calculation be done in the frontend)
        if(msg.value > 0) {
            emit FundsDeposited(msg.sender, msg.value);
        }
        
        emit ScholarshipUpdated(_scholarshipTitle, _scholarshipDescription, _scholarshipAmount, _fundTotalAmount);
    }
    
    /**
     * @dev Add more funds to the scholarship
     */
    function addFunds() public payable onlyCompany {
        require(msg.value > 0, "Must send some ETH");
        emit FundsDeposited(msg.sender, msg.value);
    }
    
    //deleteing scholarship, updates the status to closed
    function deleteScholarship() public onlyCompany {
        scholarshipStatus = ScholarshipStatus.Closed;
        emit ScholarshipDeleted();
    }
    
    //update scholarship details
    function updateScholarshipStatus(ScholarshipStatus _status) public onlyCompany {
        scholarshipStatus = _status;
        emit ScholarshipStatusUpdated(_status);
    }
    
    // to add new milestone
    function addMilestone(string memory _description, uint256 _fundPercentage) public onlyCompany {
        uint256 newTotalPercentage = totalFundPercentageAllocated.add(_fundPercentage);
        require(newTotalPercentage <= 100, "Total fund percentage cannot exceed 100%");
        
        milestones.push(Milestone({
            description: _description,
            isCompleted: false,
            fundPercentage: _fundPercentage
        }));
        
        totalFundPercentageAllocated = newTotalPercentage;
        
        emit MilestoneAdded(milestones.length - 1, _description, _fundPercentage);
    }
    
    //apply function with no validation
    function applyForScholarship() public scholarshipIsOpen {
        // Initialize student application with default values
        StudentApplication storage newApplication = studentApplications[msg.sender];
        newApplication.studentAddress = msg.sender;
        newApplication.isApproved = false;
        newApplication.fundsWithdrawn = 0;
        
        // Add to applicants array if not already included
        bool isExistingApplicant = false;
        for (uint256 i = 0; i < applicants.length; i++) {
            if (applicants[i] == msg.sender) {
                isExistingApplicant = true;
                break;
            }
        }
        
        if (!isExistingApplicant) {
            applicants.push(msg.sender);
        }
        
        emit StudentApplied(msg.sender);
    }
    
    // approve student application
    function approveStudentApplication(address _student) public onlyCompany {
        require(studentApplications[_student].studentAddress == _student, "Student has not applied");
        require(!studentApplications[_student].isApproved, "Student is already approved");
        
        studentApplications[_student].isApproved = true;
        
        // Add to approved students array
        bool isExistingApproved = false;
        for (uint256 i = 0; i < approvedStudents.length; i++) {
            if (approvedStudents[i] == _student) {
                isExistingApproved = true;
                break;
            }
        }
        
        if (!isExistingApproved) {
            approvedStudents.push(_student);
        }
        
        // Update scholarship status to InProgress if it's the first approval
        if (scholarshipStatus == ScholarshipStatus.Open && approvedStudents.length == 1) {
            scholarshipStatus = ScholarshipStatus.InProgress;
            emit ScholarshipStatusUpdated(ScholarshipStatus.InProgress);
        }
        
        emit StudentApproved(_student);
    }
    
    // function for student to complete milestones (funds will be released)
    function completeMilestone(address _student, uint256 _milestoneId) public onlyCompany nonReentrant {
        require(studentApplications[_student].isApproved, "Student is not approved for this scholarship");
        require(_milestoneId < milestones.length, "Invalid milestone ID");
        require(!studentApplications[_student].completedMilestones[_milestoneId], "Milestone already completed");
        
        // update milestone to completed
        studentApplications[_student].completedMilestones[_milestoneId] = true;
        
        milestones[_milestoneId].isCompleted = true;
        
        emit MilestoneCompleted(_student, _milestoneId);
        
        // Calculate fund release amount based on milestone percentage
        uint256 releaseAmount = scholarshipAmount.mul(milestones[_milestoneId].fundPercentage).div(100);
        
        // Check if there are sufficient funds available
        require(address(this).balance >= releaseAmount, "Insufficient funds in contract");
        
        // Update funds withdrawn before transfer to prevent reentrancy
        studentApplications[_student].fundsWithdrawn = studentApplications[_student].fundsWithdrawn.add(releaseAmount);
        
        // Transfer funds to student
        (bool success, ) = payable(_student).call{value: releaseAmount}("");
        require(success, "Transfer failed");
        
        emit FundsReleasedBasedOnMilestone(_student, _milestoneId, releaseAmount);
        
        // Check if all milestones are completed for this student
        bool allCompleted = true;
        for (uint256 i = 0; i < milestones.length; i++) {
            if (!studentApplications[_student].completedMilestones[i]) {
                allCompleted = false;
                break;
            }
        }
        
        // If all milestones are completed, update status to Completed
        if (allCompleted && scholarshipStatus == ScholarshipStatus.InProgress) {
            scholarshipStatus = ScholarshipStatus.Completed;
            emit ScholarshipStatusUpdated(ScholarshipStatus.Completed);
        }
    }
    
    //get total milestones
    function getTotalMilestones() public view returns (uint256) {
        return milestones.length;
    }
    
   //get details of specific milestones
    function getMilestone(uint256 _milestoneId) public view returns (
        string memory description,
        bool isCompleted,
        uint256 fundPercentage
    ) {
        require(_milestoneId < milestones.length, "Invalid milestone ID");
        
        Milestone storage milestone = milestones[_milestoneId];
        return (milestone.description, milestone.isCompleted, milestone.fundPercentage);
    }
    
    //check if student completed a specific milestone
    function isStudentMilestoneCompleted(address _student, uint256 _milestoneId) public view returns (bool) {
        require(_milestoneId < milestones.length, "Invalid milestone ID");
        return studentApplications[_student].completedMilestones[_milestoneId];
    }
    
    //get all applicants for the scholarship 
    function getAllApplicants() public view returns (address[] memory) {
        return applicants;
    }
    
    //get all approved applicants for the scholarship
    function getApprovedStudents() public view returns (address[] memory) {
        return approvedStudents;
    }
    
    //get the balance fund in the contract
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    //for company to withdraw access funds
    function withdrawRemainingFunds() public onlyCompany nonReentrant {
        require(scholarshipStatus == ScholarshipStatus.Closed || scholarshipStatus == ScholarshipStatus.Completed, 
                "Scholarship must be closed or completed to withdraw funds");
        
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(company).call{value: balance}("");
        require(success, "Transfer failed");
    }
    
    //deposit funds to contract
    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }
    
    //fallback function to accept funds
    fallback() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }
}