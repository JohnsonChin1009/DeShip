// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract RoleNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Supply Constraints for Student and Company Roles NFTs
    uint8 public constant MAX_STUDENT_SUPPLY = 50;
    uint8 public constant MAX_COMPANY_SUPPLY = 50;

    uint8 public studentSupply;
    uint8 public companySupply;

    mapping(address => bool) public hasRoleNFT; // Track if a user already has an NFT
    mapping(address => uint256) public userTokenId; // Store user's token ID

    constructor(address initialOwner) ERC721("RoleNFT", "ROLE") Ownable(initialOwner) {}

    function safeMintStudent(address to, string memory metadataCID) public onlyOwner returns (uint256) {
        require(studentSupply < MAX_STUDENT_SUPPLY, "Student supply limit reached");
        require(!hasRoleNFT[to], "User already owns a RoleNFT");

        uint256 tokenId = _nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked("https://ipfs.io/ipfs/", metadataCID))); // Store full IPFS URI

        studentSupply++;
        hasRoleNFT[to] = true;
        userTokenId[to] = tokenId;
        _nextTokenId++;

        return tokenId;
    }

    function safeMintCompany(address to, string memory metadataCID) public onlyOwner returns (uint256) {
        require(companySupply < MAX_COMPANY_SUPPLY, "Company supply limit reached");
        require(!hasRoleNFT[to], "User already owns a RoleNFT");

        uint256 tokenId = _nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked("https://ipfs.io/ipfs/", metadataCID))); // Store full IPFS URI

        companySupply++;
        hasRoleNFT[to] = true;
        userTokenId[to] = tokenId;
        _nextTokenId++;

        return tokenId;
    }

    function getUserRole(address user) public view returns (string memory) {
        if (!hasRoleNFT[user]) {
            return "No Role";
        }
        return isCompanyRole[userTokenId[user]] ? "Company" : "Student";
    }

    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}