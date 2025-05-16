import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ScholarshipFactory", (m) => {
  // Get deployer account
  const deployer = m.getAccount(0);
  const verifierAddress = "0xBE1f6af4111f83128d192389BDB934faDB11A19F";
  const roleNFTAddress = "0x3E16F77f78939AC48bE10112383d376D425F768D";
  // Deploy ScholarshipFactory contract with the deployer as the initial owner
  const scholarshipFactory = m.contract("ScholarshipFactory", [deployer, verifierAddress, roleNFTAddress]);

  return { scholarshipFactory };
});