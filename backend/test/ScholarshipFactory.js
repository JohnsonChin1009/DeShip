import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Scholarship Contracts", function () {
  // Contract factories
  let ScholarshipFactory, Scholarship, RoleNFT, Verifier;
  
  // Contract instances
  let scholarshipFactory, roleNFT, verifier;
  
  // Signers
  let owner, company, student1, student2, nonRoleUser;
  
  // Constants for testing
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  const ONE_ETHER = ethers.utils.parseEther("1.0");
  const MOCK_IMPACT_SCORE = 85;

  // Scholarship parameters
  const scholarshipParams = {
    title: "Test Scholarship",
    description: "A test scholarship for students",
    gpa: 3500, // 3.5 GPA in the contract's format
    additionalRequirements: "Computer Science major",
    totalAmount: ONE_ETHER,
    deadline: 0, // Will be set during tests
    milestoneTitles: ["Milestone 1", "Milestone 2"],
    milestoneAmounts: [ethers.utils.parseEther("0.4"), ethers.utils.parseEther("0.6")]
  };

  async function deployContracts() {
    // Deploy mock Verifier contract
    Verifier = await ethers.getContractFactory("Groth16Verifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
    
    // Deploy RoleNFT contract
    RoleNFT = await ethers.getContractFactory("RoleNFT");
    roleNFT = await RoleNFT.deploy();
    await roleNFT.deployed();
    
    // Mint role NFTs to test accounts
    const studentTokenURI = "https://example.com/student";
    const companyTokenURI = "https://example.com/company"; // Note the 'c' at position length-7
    
    await roleNFT.mintNFTRole(student1.address, studentTokenURI);
    await roleNFT.mintNFTRole(student2.address, studentTokenURI);
    await roleNFT.mintNFTRole(company.address, companyTokenURI);
    
    // Deploy ScholarshipFactory
    ScholarshipFactory = await ethers.getContractFactory("ScholarshipFactory");
    scholarshipFactory = await ScholarshipFactory.deploy(
      owner.address,
      verifier.address,
      roleNFT.address
    );
    await scholarshipFactory.deployed();
    
    // Verify the company address
    await scholarshipFactory.connect(owner).verifyAddress(company.address);
  }

  beforeEach(async function () {
    [owner, company, student1, student2, nonRoleUser] = await ethers.getSigners();
    await deployContracts();
    
    // Set deadline for scholarship to 30 days from now
    scholarshipParams.deadline = (await time.latest()) + 30 * 24 * 60 * 60;
  });

  describe("ScholarshipFactory", function () {
    it("Should initialize with correct parameters", async function () {
      expect(await scholarshipFactory.owner()).to.equal(owner.address);
      expect(await scholarshipFactory.verifierAddress()).to.equal(verifier.address);
      expect(await scholarshipFactory.roleNFT()).to.equal(roleNFT.address);
    });

    it("Should allow owner to verify a company", async function () {
      const testCompany = nonRoleUser.address;
      await scholarshipFactory.connect(owner).verifyAddress(testCompany);
      expect(await scholarshipFactory.verifiedCompanies(testCompany)).to.equal(true);
    });

    it("Should not allow non-owners to verify a company", async function () {
      const testCompany = nonRoleUser.address;
      await expect(
        scholarshipFactory.connect(company).verifyAddress(testCompany)
      ).to.be.reverted;
    });

    it("Should not allow verifying an already verified company", async function () {
      await expect(
        scholarshipFactory.connect(owner).verifyAddress(company.address)
      ).to.be.revertedWith("Address  verified");
    });

    it("Should allow owner to update the RoleNFT address", async function () {
      const newRoleNFT = nonRoleUser.address;
      await scholarshipFactory.connect(owner).updateRoleNFTAddress(newRoleNFT);
      expect(await scholarshipFactory.roleNFT()).to.equal(newRoleNFT);
    });

    it("Should not allow updating to zero address", async function () {
      await expect(
        scholarshipFactory.connect(owner).updateRoleNFTAddress(ZERO_ADDRESS)
      ).to.be.revertedWith("Invalid address");
    });

    it("Should not allow non-owners to update the RoleNFT address", async function () {
      await expect(
        scholarshipFactory.connect(company).updateRoleNFTAddress(nonRoleUser.address)
      ).to.be.reverted;
    });

    it("Should create a scholarship when a company calls with sufficient funds", async function () {
      const initialScholarshipsCount = await scholarshipFactory.getTotalScholarships();
      
      const tx = await scholarshipFactory.connect(company).createScholarship(
        scholarshipParams.title,
        scholarshipParams.description,
        scholarshipParams.gpa,
        scholarshipParams.additionalRequirements,
        scholarshipParams.totalAmount,
        scholarshipParams.deadline,
        scholarshipParams.milestoneTitles,
        scholarshipParams.milestoneAmounts,
        { value: scholarshipParams.totalAmount }
      );
      
      const receipt = await tx.wait();
      
      // Filter for ScholarshipCreated event
      const event = receipt.events?.find(e => e.event === "ScholarshipCreated");
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(event).to.not.be.undefined;
      
      // Check new scholarship was created
      const newCount = await scholarshipFactory.getTotalScholarships();
      expect(newCount).to.equal(initialScholarshipsCount.add(1));
      
      // Check company's scholarships were updated
      const companyScholarships = await scholarshipFactory.getCompanyScholarships(company.address);
      expect(companyScholarships.length).to.be.at.least(1);
      
      // Get the scholarship address from the event
      const scholarshipAddress = event.args.scholarshipAddress;
      expect(scholarshipAddress).to.not.equal(ZERO_ADDRESS);
      
      // Verify the scholarship was correctly recorded
      const allScholarships = await scholarshipFactory.getAllScholarships();
      expect(allScholarships).to.include(scholarshipAddress);
    });

    it("Should not allow creating a scholarship with insufficient funds", async function () {
      const insufficientAmount = ethers.utils.parseEther("0.5");
      
      await expect(
        scholarshipFactory.connect(company).createScholarship(
          scholarshipParams.title,
          scholarshipParams.description,
          scholarshipParams.gpa,
          scholarshipParams.additionalRequirements,
          scholarshipParams.totalAmount,
          scholarshipParams.deadline,
          scholarshipParams.milestoneTitles,
          scholarshipParams.milestoneAmounts,
          { value: insufficientAmount }
        )
      ).to.be.revertedWith("Insufficient funds");
    });

    it("Should not allow non-companies to create scholarships", async function () {
      await expect(
        scholarshipFactory.connect(student1).createScholarship(
          scholarshipParams.title,
          scholarshipParams.description,
          scholarshipParams.gpa,
          scholarshipParams.additionalRequirements,
          scholarshipParams.totalAmount,
          scholarshipParams.deadline,
          scholarshipParams.milestoneTitles,
          scholarshipParams.milestoneAmounts,
          { value: scholarshipParams.totalAmount }
        )
      ).to.be.revertedWith("Not a company role");
    });

    it("Should not allow creating scholarships with mismatched milestones", async function () {
      const mismatchedMilestones = ["Milestone 1"];
      
      await expect(
        scholarshipFactory.connect(company).createScholarship(
          scholarshipParams.title,
          scholarshipParams.description,
          scholarshipParams.gpa,
          scholarshipParams.additionalRequirements,
          scholarshipParams.totalAmount,
          scholarshipParams.deadline,
          mismatchedMilestones,
          scholarshipParams.milestoneAmounts,
          { value: scholarshipParams.totalAmount }
        )
      ).to.be.revertedWith("Milestone mismatch");
    });

    it("Should correctly return all scholarship addresses", async function () {
      // Create a scholarship
      await scholarshipFactory.connect(company).createScholarship(
        scholarshipParams.title,
        scholarshipParams.description,
        scholarshipParams.gpa,
        scholarshipParams.additionalRequirements,
        scholarshipParams.totalAmount,
        scholarshipParams.deadline,
        scholarshipParams.milestoneTitles,
        scholarshipParams.milestoneAmounts,
        { value: scholarshipParams.totalAmount }
      );
      
      const allScholarships = await scholarshipFactory.getAllScholarships();
      expect(allScholarships.length).to.be.at.least(1);
      
      const scholarshipByIndex = await scholarshipFactory.getScholarshipByIndex(0);
      expect(scholarshipByIndex).to.equal(allScholarships[0]);
    });
  });

  describe("Scholarship", function () {
    let scholarshipAddress;
    let scholarship;

    beforeEach(async function () {
      // Create a new scholarship for each test
      const tx = await scholarshipFactory.connect(company).createScholarship(
        scholarshipParams.title,
        scholarshipParams.description,
        scholarshipParams.gpa,
        scholarshipParams.additionalRequirements,
        scholarshipParams.totalAmount,
        scholarshipParams.deadline,
        scholarshipParams.milestoneTitles,
        scholarshipParams.milestoneAmounts,
        { value: scholarshipParams.totalAmount }
      );
      
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "ScholarshipCreated");
      scholarshipAddress = event.args.scholarshipAddress;
      
      // Get the scholarship contract instance
      Scholarship = await ethers.getContractFactory("Scholarship");
      scholarship = await Scholarship.attach(scholarshipAddress);
    });

    it("Should initialize with correct parameters", async function () {
      expect(await scholarship.company()).to.equal(company.address);
      expect(await scholarship.title()).to.equal(scholarshipParams.title);
      expect(await scholarship.description()).to.equal(scholarshipParams.description);
      
      const eligibility = await scholarship.eligibility();
      expect(eligibility.gpa).to.equal(scholarshipParams.gpa);
      expect(eligibility.additionalRequirements).to.equal(scholarshipParams.additionalRequirements);
      
      expect(await scholarship.totalAmount()).to.equal(scholarshipParams.totalAmount);
      expect(await scholarship.deadline()).to.equal(scholarshipParams.deadline);
      expect(await scholarship.status()).to.equal(0); // Open status
      
      // Check milestones
      expect(await scholarship.getTotalMilestones()).to.equal(scholarshipParams.milestoneTitles.length);
      
      const milestone0 = await scholarship.getMilestone(0);
      expect(milestone0.titleReturn).to.equal(scholarshipParams.milestoneTitles[0]);
      expect(milestone0.amount).to.equal(scholarshipParams.milestoneAmounts[0]);
      expect(milestone0.isCompleted).to.equal(false);
      expect(milestone0.fundsReleased).to.equal(false);
    });

    it("Should allow students to apply", async function () {
      await scholarship.connect(student1).applyForScholarship(MOCK_IMPACT_SCORE);
      
      const applicants = await scholarship.getApplicants();
      expect(applicants.length).to.equal(1);
      expect(applicants[0]).to.equal(student1.address);
    });

    it("Should not allow non-students to apply", async function () {
      await expect(
        scholarship.connect(nonRoleUser).applyForScholarship(MOCK_IMPACT_SCORE)
      ).to.be.revertedWith("No role");
    });

    it("Should not allow applying twice", async function () {
      await scholarship.connect(student1).applyForScholarship(MOCK_IMPACT_SCORE);
      
      await expect(
        scholarship.connect(student1).applyForScholarship(MOCK_IMPACT_SCORE)
      ).to.be.revertedWith("Already applied");
    });

    it("Should allow company to approve students", async function () {
      await scholarship.connect(student1).applyForScholarship(MOCK_IMPACT_SCORE);
      await scholarship.connect(company).approveStudent(student1.address);
      
      const studentApp = await scholarship.studentApplications(student1.address);
      expect(studentApp.isApproved).to.equal(true);
      
      // Check that scholarship status is updated to InProgress
      expect(await scholarship.status()).to.equal(1); // InProgress status
    });

    it("Should not allow non-company to approve students", async function () {
      await scholarship.connect(student1).applyForScholarship(MOCK_IMPACT_SCORE);
      
      await expect(
        scholarship.connect(student1).approveStudent(student1.address)
      ).to.be.revertedWith("Unauthorized");
    });

    it("Should allow marking milestones as completed", async function () {
      // Apply and approve student
      await scholarship.connect(student1).applyForScholarship(MOCK_IMPACT_SCORE);
      await scholarship.connect(company).approveStudent(student1.address);
      
      // Complete milestone
      await scholarship.connect(company).completeMilestone(student1.address, 0);
      
      // Check milestone is completed
      const milestone = await scholarship.getMilestone(0);
      expect(milestone.isCompleted).to.equal(true);
    });

    it("Should update scholarship status when all milestones are completed and paid", async function () {
      // Apply and approve student
      await scholarship.connect(student1).applyForScholarship(MOCK_IMPACT_SCORE);
      await scholarship.connect(company).approveStudent(student1.address);
      
      // Complete all milestones
      for (let i = 0; i < scholarshipParams.milestoneTitles.length; i++) {
        await scholarship.connect(company).completeMilestone(student1.address, i);
      }
      
      // Trigger payment for all milestones via performUpkeep
      const checkUpkeepData = await scholarship.checkUpkeep("0x");
      if (checkUpkeepData[0]) {
        await scholarship.performUpkeep(checkUpkeepData[1]);
      }
      
      // Check if all milestones are marked as paid
      for (let i = 0; i < scholarshipParams.milestoneTitles.length; i++) {
        const milestone = await scholarship.getMilestone(i);
        expect(milestone.fundsReleased).to.equal(true);
      }
      
      // Check scholarship status is Completed
      expect(await scholarship.status()).to.equal(3); // Completed status
    });

    it("Should allow company to update scholarship details when open", async function () {
      const newTitle = "Updated Scholarship";
      const newDesc = "Updated Description";
      const newGpa = 3800; // 3.8 GPA
      const newReqs = "Engineering major";
      const newDeadline = scholarshipParams.deadline + 7 * 24 * 60 * 60; // +7 days
      
      await scholarship.connect(company).updateScholarshipDetails(
        newTitle,
        newDesc,
        newGpa,
        newReqs,
        newDeadline
      );
      
      expect(await scholarship.title()).to.equal(newTitle);
      expect(await scholarship.description()).to.equal(newDesc);
      
      const eligibility = await scholarship.eligibility();
      expect(eligibility.gpa).to.equal(newGpa);
      expect(eligibility.additionalRequirements).to.equal(newReqs);
      
      expect(await scholarship.deadline()).to.equal(newDeadline);
    });

    it("Should not allow updating scholarship details when not open", async function () {
      // Apply and approve student to change status
      await scholarship.connect(student1).applyForScholarship(MOCK_IMPACT_SCORE);
      await scholarship.connect(company).approveStudent(student1.address);
      
      // Check that status is now InProgress
      expect(await scholarship.status()).to.equal(1);
      
      // Try to update details
      await expect(
        scholarship.connect(company).updateScholarshipDetails(
          "New Title",
          "New Description",
          4000,
          "New Requirements",
          scholarshipParams.deadline + 1000
        )
      ).to.be.revertedWith("Scholarship not open");
    });

    it("Should check and perform upkeep properly via Chainlink Automation", async function () {
      // Apply and approve student
      await scholarship.connect(student1).applyForScholarship(MOCK_IMPACT_SCORE);
      await scholarship.connect(company).approveStudent(student1.address);
      
      // Complete a milestone
      await scholarship.connect(company).completeMilestone(student1.address, 0);
      
      // Check upkeep
      const [upkeepNeeded, performData] = await scholarship.checkUpkeep("0x");
      expect(upkeepNeeded).to.equal(true);
      
      // Student balance before
      const balanceBefore = await ethers.provider.getBalance(student1.address);
      
      // Perform upkeep to trigger payment
      await scholarship.performUpkeep(performData);
      
      // Check milestone is marked as paid
      const milestone = await scholarship.getMilestone(0);
      expect(milestone.fundsReleased).to.equal(true);
      
      // Check student received payment
      const balanceAfter = await ethers.provider.getBalance(student1.address);
      expect(balanceAfter.sub(balanceBefore)).to.equal(scholarshipParams.milestoneAmounts[0]);
    });

    it("Should handle multiple students correctly", async function () {
      // Apply with two students
      await scholarship.connect(student1).applyForScholarship(MOCK_IMPACT_SCORE);
      await scholarship.connect(student2).applyForScholarship(MOCK_IMPACT_SCORE + 10);
      
      // Approve both
      await scholarship.connect(company).approveStudent(student1.address);
      await scholarship.connect(company).approveStudent(student2.address);
      
      // Complete different milestones for each student
      await scholarship.connect(company).completeMilestone(student1.address, 0);
      await scholarship.connect(company).completeMilestone(student2.address, 1);
      
      // Check upkeep
      const [upkeepNeeded, performData] = await scholarship.checkUpkeep("0x");
      expect(upkeepNeeded).to.equal(true);
      
      // Perform upkeep to trigger payments
      await scholarship.performUpkeep(performData);
      
      // Check student balances
      const student1App = await scholarship.studentApplications(student1.address);
      const student2App = await scholarship.studentApplications(student2.address);
      
      expect(student1App.fundsWithdrawn).to.equal(scholarshipParams.milestoneAmounts[0]);
      expect(student2App.fundsWithdrawn).to.equal(scholarshipParams.milestoneAmounts[1]);
    });

    it("Should reject applications after deadline", async function () {
      // Fast-forward time to after the deadline
      await time.increase(31 * 24 * 60 * 60); // 31 days
      
      await expect(
        scholarship.connect(student1).applyForScholarship(MOCK_IMPACT_SCORE)
      ).to.be.revertedWith("Deadline passed");
    });

    it("Should prevent milestone completion for unapproved student", async function () {
      await scholarship.connect(student1).applyForScholarship(MOCK_IMPACT_SCORE);
      
      // Try to complete milestone without approving student
      await expect(
        scholarship.connect(company).completeMilestone(student1.address, 0)
      ).to.be.revertedWith("Student not approved");
    });

    it("Should not allow completing the same milestone twice", async function () {
      // Apply and approve student
      await scholarship.connect(student1).applyForScholarship(MOCK_IMPACT_SCORE);
      await scholarship.connect(company).approveStudent(student1.address);
      
      // Complete milestone once
      await scholarship.connect(company).completeMilestone(student1.address, 0);
      
      // Try to complete same milestone again
      await expect(
        scholarship.connect(company).completeMilestone(student1.address, 0)
      ).to.be.revertedWith("Milestone completed");
    });
  });
});