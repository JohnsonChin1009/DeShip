import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("TestContract", (m) => {
  // Get deployer account
  const deployer = m.getAccount(0);

  // Deploy RoleNFT contract with the deployer as the initial owner
  const roleNFT = m.contract("TestContract", [deployer]);

  return { roleNFT };
});