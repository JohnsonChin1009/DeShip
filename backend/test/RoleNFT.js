import { expect } from "chai";
import { ethers } from "hardhat";

describe("RoleNFT Contract", function () {
    let RoleNFT, roleNFT, user1, user2;

    // Initialize the contract and the signers before testing
    beforeEach(async function () {
        [user1, user2 ] = await ethers.getSigners();
        RoleNFT = await ethers.getContractFactory("RoleNFT");
        roleNFT = await RoleNFT.deploy();
        await roleNFT.deployed();
    });

    it("Should allow minting a Student NFT", async function () {
        const tokenURI = "https://salmon-accepted-aphid-258.mypinata.cloud/ipfs/bafkreibbni5fiag3k27r6dcbhndssfucdtitwba355riaanauunz3svt7i"

        await roleNFT.mintNFTRole(user1.address, tokenURI);

        expect(await roleNFT.ownerOf(1)).to.equal(user1.address);
    });

    it("Should allow minting a Company NFT", async function() {
        const tokenURI = "https://salmon-accepted-aphid-258.mypinata.cloud/ipfs/bafkreiam2nsbgyddd2jobagmjkictjpgi2mazf2w4pkedl5dek3y5by4pq";

        await roleNFT.mintNFTRole(user2.address, tokenURI);
        
        expect(await roleNFT.ownerOf(2)).to.equal(user2.address);
    });

    it("Should prevent duplicate NFT minting for the same user", async function () {
        const tokenURI = "https://salmon-accepted-aphid-258.mypinata.cloud/ipfs/bafkreibbni5fiag3k27r6dcbhndssfucdtitwba355riaanauunz3svt7i";
    
        await roleNFT.mintNFTRole(user1.address, tokenURI);
    
        await expect(
          roleNFT.mintNFTRole(user1.address, tokenURI)
        ).to.be.revertedWith("User already owns a RoleNFT");
    });

    it("Should correctly store and retrieve tokenURI", async function () {
        const tokenURI = "https://salmon-accepted-aphid-258.mypinata.cloud/ipfs/bafkreiam2nsbgyddd2jobagmjkictjpgi2mazf2w4pkedl5dek3y5by4pq";
    
        await roleNFT.mintNFTRole(user1.address, tokenURI);
    
        expect(await roleNFT.tokenURI(1)).to.equal(tokenURI);
    });
})