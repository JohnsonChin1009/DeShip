import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ScholarshipAutomationHandler", (m) => {
  const factoryAddress= "0x406Ef3A0fAd1B7347C45a1d4ABBb09AF7b4d203f";
  
  // Deploy ScholarshipFactory contract with the deployer as the initial owner
  const scholarshipAutomationHandler = m.contract("ScholarshipAutomationHandler", [factoryAddress]);

  return { scholarshipAutomationHandler };
});