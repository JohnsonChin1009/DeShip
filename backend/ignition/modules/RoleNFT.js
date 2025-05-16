import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Groth16Verifier", (m) => {
  // Get deployer account
  const deployer = m.getAccount(0);

  // Deploy RoleNFT contract with the deployer as the initial owner
  const groth16Verifier = m.contract("Groth16Verifier", [deployer]);

  return { groth16Verifier };
});