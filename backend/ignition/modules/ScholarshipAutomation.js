import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ScholarshipAutomationHandler", (m) => {
  const factoryAddress= "0xDefBfC26831268F02ecFbf20905B559E7B3373C9";
  
  // Deploy ScholarshipFactory contract with the deployer as the initial owner
  const scholarshipAutomationHandler = m.contract("ScholarshipAutomationHandler", [factoryAddress]);

  return { scholarshipAutomationHandler };
});