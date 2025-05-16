import { expect } from "chai";
import { ethers } from "hardhat";

describe("ScholarshipAutomationHandler", function () {
  // Contract instances
  let scholarshipAutomationHandler;
  let mockScholarshipFactory;
  let mockScholarship1;
  let mockScholarship2;
  let mockScholarship3;
  
  // Signers
  let owner;
  let otherAccount;

  // Setup mock contracts for testing
  const deployMockScholarshipFactory = async () => {
    const MockScholarshipFactory = await ethers.getContractFactory("MockScholarshipFactory");
    const factory = await MockScholarshipFactory.deploy();
    await factory.deployed();
    return factory;
  };

  const deployMockScholarship = async (needsUpkeep = true, shouldFail = false) => {
    const MockScholarship = await ethers.getContractFactory("MockScholarship");
    const scholarship = await MockScholarship.deploy(needsUpkeep, shouldFail);
    await scholarship.deployed();
    return scholarship;
  };

  beforeEach(async function () {
    // Get signers
    [owner, otherAccount, ...addrs] = await ethers.getSigners();

    // Deploy mock contracts
    mockScholarshipFactory = await deployMockScholarshipFactory();
    
    // Deploy mock scholarships with different behaviors
    mockScholarship1 = await deployMockScholarship(true, false); // Needs upkeep, won't fail
    mockScholarship2 = await deployMockScholarship(false, false); // Doesn't need upkeep
    mockScholarship3 = await deployMockScholarship(true, true); // Needs upkeep, will fail
    
    // Register mock scholarships to factory
    await mockScholarshipFactory.setScholarships([
      mockScholarship1.address, 
      mockScholarship2.address,
      mockScholarship3.address
    ]);
    
    // Deploy main contract
    const ScholarshipAutomationHandler = await ethers.getContractFactory("ScholarshipAutomationHandler");
    scholarshipAutomationHandler = await ScholarshipAutomationHandler.deploy(mockScholarshipFactory.address);
    await scholarshipAutomationHandler.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await scholarshipAutomationHandler.owner()).to.equal(owner.address);
    });

    it("Should set the right scholarship factory address", async function () {
      expect(await scholarshipAutomationHandler.scholarshipFactoryAddress()).to.equal(mockScholarshipFactory.address);
    });

    it("Should initialize with default gas limits", async function () {
      expect(await scholarshipAutomationHandler.checkGasLimit()).to.equal(2_000_000);
      expect(await scholarshipAutomationHandler.performGasLimit()).to.equal(2_300_000);
    });

    it("Should fail if initialized with zero address", async function () {
      const ScholarshipAutomationHandler = await ethers.getContractFactory("ScholarshipAutomationHandler");
      await expect(
        ScholarshipAutomationHandler.deploy(ethers.constants.AddressZero)
      ).to.be.revertedWith("Invalid factory address");
    });
  });

  describe("checkUpkeep", function () {
    it("Should correctly identify scholarships that need upkeep", async function () {
      const [upkeepNeeded, performData] = await scholarshipAutomationHandler.callStatic.checkUpkeep("0x");
      
      expect(upkeepNeeded).to.equal(true);
      
      const decoded = ethers.utils.defaultAbiCoder.decode(
        ["address[]", "bytes[]", "uint256"],
        performData
      );
      
      const targets = decoded[0];
      const count = decoded[2];
      
      expect(count).to.equal(2); // Two scholarships need upkeep (1 and 3)
      expect(targets[0]).to.equal(mockScholarship1.address);
      expect(targets[1]).to.equal(mockScholarship3.address);
    });

    it("Should return false when no scholarships need upkeep", async function () {
      // Reset scholarship factory with only scholarships that don't need upkeep
      const noUpkeepScholarship = await deployMockScholarship(false, false);
      await mockScholarshipFactory.setScholarships([noUpkeepScholarship.address]);
      
      const [upkeepNeeded, performData] = await scholarshipAutomationHandler.callStatic.checkUpkeep("0x");
      expect(upkeepNeeded).to.equal(false);
      
      const decoded = ethers.utils.defaultAbiCoder.decode(
        ["address[]", "bytes[]", "uint256"],
        performData
      );
      expect(decoded[2]).to.equal(0); // No scholarships need upkeep
    });

    it("Should handle empty scholarship list", async function () {
      await mockScholarshipFactory.setScholarships([]);
      
      const [upkeepNeeded] = await scholarshipAutomationHandler.callStatic.checkUpkeep("0x");
      expect(upkeepNeeded).to.equal(false);
    });
  });

  describe("performUpkeep", function () {
    it("Should perform upkeep on eligible scholarships", async function () {
      // First check which scholarships need upkeep
      const [, performData] = await scholarshipAutomationHandler.callStatic.checkUpkeep("0x");
      
      // Execute performUpkeep and check events
      await expect(scholarshipAutomationHandler.performUpkeep(performData))
        .to.emit(scholarshipAutomationHandler, "UpkeepPerformed")
        .withArgs(mockScholarship1.address);
        
      // Should also emit failure for the failing scholarship
      await expect(scholarshipAutomationHandler.performUpkeep(performData))
        .to.emit(scholarshipAutomationHandler, "UpkeepFailed")
        .withArgs(mockScholarship3.address, "Intentional failure");
        
      // Check completion event
      await expect(scholarshipAutomationHandler.performUpkeep(performData))
        .to.emit(scholarshipAutomationHandler, "CheckCompleted");
    });

    it("Should handle errors gracefully when performing upkeep", async function () {
      // Create malformed performData (with a non-scholarship address)
      const targets = [ethers.constants.AddressZero];
      const datas = ["0x"];
      const count = 1;
      const malformedPerformData = ethers.utils.defaultAbiCoder.encode(
        ["address[]", "bytes[]", "uint256"],
        [targets, datas, count]
      );
      
      // Should emit UpkeepFailed with "Unknown error"
      await expect(scholarshipAutomationHandler.performUpkeep(malformedPerformData))
        .to.emit(scholarshipAutomationHandler, "UpkeepFailed")
        .withArgs(ethers.constants.AddressZero, "Unknown error");
    });
  });

  describe("Administrative functions", function () {
    it("Should allow owner to update gas limits", async function () {
      const newCheckLimit = 3_000_000;
      const newPerformLimit = 3_500_000;
      
      await expect(scholarshipAutomationHandler.updateGasLimits(newCheckLimit, newPerformLimit))
        .to.emit(scholarshipAutomationHandler, "GasLimitUpdated")
        .withArgs(newCheckLimit, newPerformLimit);
        
      expect(await scholarshipAutomationHandler.checkGasLimit()).to.equal(newCheckLimit);
      expect(await scholarshipAutomationHandler.performGasLimit()).to.equal(newPerformLimit);
    });

    it("Should prevent non-owners from updating gas limits", async function () {
      await expect(
        scholarshipAutomationHandler.connect(otherAccount).updateGasLimits(3_000_000, 3_500_000)
      ).to.be.revertedWith("Unauthorized access");
    });

    it("Should prevent setting gas limits too low", async function () {
      await expect(
        scholarshipAutomationHandler.updateGasLimits(50_000, 3_500_000)
      ).to.be.revertedWith("Gas limits too low");
      
      await expect(
        scholarshipAutomationHandler.updateGasLimits(3_000_000, 50_000)
      ).to.be.revertedWith("Gas limits too low");
    });

    it("Should allow owner to update factory address", async function () {
      const newFactory = await deployMockScholarshipFactory();
      
      await expect(scholarshipAutomationHandler.updateScholarshipFactoryAddress(newFactory.address))
        .to.emit(scholarshipAutomationHandler, "FactoryAddressUpdated")
        .withArgs(newFactory.address);
        
      expect(await scholarshipAutomationHandler.scholarshipFactoryAddress()).to.equal(newFactory.address);
    });

    it("Should prevent setting factory address to zero", async function () {
      await expect(
        scholarshipAutomationHandler.updateScholarshipFactoryAddress(ethers.constants.AddressZero)
      ).to.be.revertedWith("Invalid factory address");
    });
  });

  describe("Manual trigger functions", function () {
    it("Should allow owner to manually trigger upkeep for a scholarship", async function () {
      await expect(scholarshipAutomationHandler.manualTriggerUpkeep(mockScholarship1.address))
        .to.emit(scholarshipAutomationHandler, "UpkeepPerformed")
        .withArgs(mockScholarship1.address);
    });

    it("Should handle failures when manually triggering upkeep", async function () {
      await expect(scholarshipAutomationHandler.manualTriggerUpkeep(mockScholarship3.address))
        .to.emit(scholarshipAutomationHandler, "UpkeepFailed")
        .withArgs(mockScholarship3.address, "Intentional failure");
    });

    it("Should prevent triggering upkeep for zero address", async function () {
      await expect(
        scholarshipAutomationHandler.manualTriggerUpkeep(ethers.constants.AddressZero)
      ).to.be.revertedWith("Invalid address");
    });

    it("Should allow owner to batch trigger upkeep", async function () {
      await expect(scholarshipAutomationHandler.batchTriggerUpkeep([mockScholarship1.address, mockScholarship2.address]))
        .to.emit(scholarshipAutomationHandler, "UpkeepPerformed")
        .withArgs(mockScholarship1.address);
    });
  });

  describe("Fund management", function () {
    it("Should allow owner to withdraw ETH", async function () {
      // Send some ETH to the contract
      await owner.sendTransaction({
        to: scholarshipAutomationHandler.address,
        value: ethers.utils.parseEther("1.0")
      });
      
      const initialBalance = await ethers.provider.getBalance(owner.address);
      const contractBalance = await ethers.provider.getBalance(scholarshipAutomationHandler.address);
      
      // Withdraw ETH
      const tx = await scholarshipAutomationHandler.withdrawETH();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      
      const finalBalance = await ethers.provider.getBalance(owner.address);
      const expectedBalance = initialBalance.add(contractBalance).sub(gasCost);
      
      expect(finalBalance).to.be.closeTo(expectedBalance, ethers.utils.parseEther("0.01"));
      expect(await ethers.provider.getBalance(scholarshipAutomationHandler.address)).to.equal(0);
    });

    it("Should prevent non-owners from withdrawing ETH", async function () {
      await expect(
        scholarshipAutomationHandler.connect(otherAccount).withdrawETH()
      ).to.be.revertedWith("Unauthorized access");
    });
  });
});