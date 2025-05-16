import { expect } from "chai";
import { ethers } from "hardhat";

describe("RoleNFT", function () {
  let RoleNFT;
  let roleNFT;
  let owner;
  let student1;
  let student2;
  let company1;
  let company2;

  // Sample IPFS CIDs for metadata
  const studentMetadataCID = "QmSampleStudentMetadataCID123456789";
  const companyMetadataCID = "QmSampleCompanyMetadataCID987654321";

  beforeEach(async function () {
    // Get signers
    [owner, student1, student2, company1, company2, ...addrs] = await ethers.getSigners();

    // Deploy the contract
    RoleNFT = await ethers.getContractFactory("RoleNFT");
    roleNFT = await RoleNFT.deploy(owner.address);
    await roleNFT.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await roleNFT.owner()).to.equal(owner.address);
    });

    it("Should have correct initial values", async function () {
      expect(await roleNFT.studentSupply()).to.equal(0);
      expect(await roleNFT.companySupply()).to.equal(0);
      expect(await roleNFT.MAX_STUDENT_SUPPLY()).to.equal(50);
      expect(await roleNFT.MAX_COMPANY_SUPPLY()).to.equal(50);
    });
  });

  describe("Student NFT Minting", function () {
    it("Should mint a student NFT correctly", async function () {
      // Mint a student NFT
      await roleNFT.safeMintStudent(student1.address, studentMetadataCID);

      // Check token ownership
      expect(await roleNFT.balanceOf(student1.address)).to.equal(1);
      expect(await roleNFT.ownerOf(0)).to.equal(student1.address);

      // Check role mapping
      expect(await roleNFT.hasRoleNFT(student1.address)).to.equal(true);
      expect(await roleNFT.userTokenId(student1.address)).to.equal(0);
      expect(await roleNFT.getUserRole(student1.address)).to.equal("Student");

      // Verify studentSupply incremented
      expect(await roleNFT.studentSupply()).to.equal(1);
    });

    it("Should set the correct token URI for student NFT", async function () {
      await roleNFT.safeMintStudent(student1.address, studentMetadataCID);
      expect(await roleNFT.tokenURI(0)).to.equal(`https://ipfs.io/ipfs/${studentMetadataCID}`);
    });

    it("Should prevent minting if student already has an NFT", async function () {
      await roleNFT.safeMintStudent(student1.address, studentMetadataCID);
      await expect(
        roleNFT.safeMintStudent(student1.address, studentMetadataCID)
      ).to.be.revertedWith("User already owns a RoleNFT");
    });

    it("Should enforce student supply limit", async function () {
      // Mint MAX_STUDENT_SUPPLY students
      for (let i = 0; i < 50; i++) {
        const newAddress = ethers.Wallet.createRandom().address;
        await roleNFT.safeMintStudent(newAddress, studentMetadataCID);
      }

      // Try to mint one more
      const extraAddress = ethers.Wallet.createRandom().address;
      await expect(
        roleNFT.safeMintStudent(extraAddress, studentMetadataCID)
      ).to.be.revertedWith("Student supply limit reached");
    });

    it("Should only allow owner to mint student NFTs", async function () {
      await expect(
        roleNFT.connect(student1).safeMintStudent(student2.address, studentMetadataCID)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Company NFT Minting", function () {
    it("Should mint a company NFT correctly", async function () {
      // Mint a company NFT
      await roleNFT.safeMintCompany(company1.address, companyMetadataCID);

      // Check token ownership
      expect(await roleNFT.balanceOf(company1.address)).to.equal(1);
      expect(await roleNFT.ownerOf(0)).to.equal(company1.address);

      // Check role mapping
      expect(await roleNFT.hasRoleNFT(company1.address)).to.equal(true);
      expect(await roleNFT.userTokenId(company1.address)).to.equal(0);
      expect(await roleNFT.isCompanyRole(0)).to.equal(true);
      expect(await roleNFT.getUserRole(company1.address)).to.equal("Company");

      // Verify companySupply incremented
      expect(await roleNFT.companySupply()).to.equal(1);
    });

    it("Should set the correct token URI for company NFT", async function () {
      await roleNFT.safeMintCompany(company1.address, companyMetadataCID);
      expect(await roleNFT.tokenURI(0)).to.equal(`https://ipfs.io/ipfs/${companyMetadataCID}`);
    });

    it("Should prevent minting if company already has an NFT", async function () {
      await roleNFT.safeMintCompany(company1.address, companyMetadataCID);
      await expect(
        roleNFT.safeMintCompany(company1.address, companyMetadataCID)
      ).to.be.revertedWith("User already owns a RoleNFT");
    });

    it("Should enforce company supply limit", async function () {
      // Mint MAX_COMPANY_SUPPLY companies
      for (let i = 0; i < 50; i++) {
        const newAddress = ethers.Wallet.createRandom().address;
        await roleNFT.safeMintCompany(newAddress, companyMetadataCID);
      }

      // Try to mint one more
      const extraAddress = ethers.Wallet.createRandom().address;
      await expect(
        roleNFT.safeMintCompany(extraAddress, companyMetadataCID)
      ).to.be.revertedWith("Company supply limit reached");
    });

    it("Should only allow owner to mint company NFTs", async function () {
      await expect(
        roleNFT.connect(company1).safeMintCompany(company2.address, companyMetadataCID)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Role Verification", function () {
    it("Should report correct roles for different users", async function () {
      // Mint a student NFT
      await roleNFT.safeMintStudent(student1.address, studentMetadataCID);
      
      // Mint a company NFT
      await roleNFT.safeMintCompany(company1.address, companyMetadataCID);

      // Check roles
      expect(await roleNFT.getUserRole(student1.address)).to.equal("Student");
      expect(await roleNFT.getUserRole(company1.address)).to.equal("Company");
      expect(await roleNFT.getUserRole(student2.address)).to.equal("No Role");
    });

    it("Should maintain correct token IDs and roles after multiple mints", async function () {
      // Mint multiple NFTs
      await roleNFT.safeMintStudent(student1.address, studentMetadataCID);
      await roleNFT.safeMintCompany(company1.address, companyMetadataCID);
      await roleNFT.safeMintStudent(student2.address, studentMetadataCID);
      await roleNFT.safeMintCompany(company2.address, companyMetadataCID);

      // Check token IDs
      expect(await roleNFT.userTokenId(student1.address)).to.equal(0);
      expect(await roleNFT.userTokenId(company1.address)).to.equal(1);
      expect(await roleNFT.userTokenId(student2.address)).to.equal(2);
      expect(await roleNFT.userTokenId(company2.address)).to.equal(3);

      // Check roles
      expect(await roleNFT.getUserRole(student1.address)).to.equal("Student");
      expect(await roleNFT.getUserRole(company1.address)).to.equal("Company");
      expect(await roleNFT.getUserRole(student2.address)).to.equal("Student");
      expect(await roleNFT.getUserRole(company2.address)).to.equal("Company");

      // Verify supplies
      expect(await roleNFT.studentSupply()).to.equal(2);
      expect(await roleNFT.companySupply()).to.equal(2);
    });
  });

  describe("ERC721 Standard Compliance", function () {
    it("Should support ERC721 interface", async function () {
      // ERC721 interface ID
      const ERC721InterfaceId = "0x80ac58cd";
      expect(await roleNFT.supportsInterface(ERC721InterfaceId)).to.equal(true);
    });

    it("Should support ERC721Metadata interface", async function () {
      // ERC721Metadata interface ID
      const ERC721MetadataInterfaceId = "0x5b5e139f";
      expect(await roleNFT.supportsInterface(ERC721MetadataInterfaceId)).to.equal(true);
    });
  });
});