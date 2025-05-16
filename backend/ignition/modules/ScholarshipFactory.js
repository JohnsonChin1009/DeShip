import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ScholarshipFactory", (m) => {
  // Get deployer account
  const deployer = m.getAccount(0);
  const verifierAddress = "0xBE1f6af4111f83128d192389BDB934faDB11A19F";
  // Deploy ScholarshipFactory contract with the deployer as the initial owner
  const scholarshipFactory = m.contract("ScholarshipFactory", [deployer, verifierAddress]);

  return { scholarshipFactory };
});