import { ethers } from "ethers";
import { roleNFT_CA, roleNFT_ABI } from "@/lib/contractABI";

export async function mintNFTtoUser(walletAddress: string, role: string): Promise<{ txHash: string } | null> {
  try {
    if (!walletAddress || !role) throw new Error("Missing wallet address or role");

    const provider = new ethers.JsonRpcProvider("https://sepolia-rpc.scroll.io/");
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const contract = new ethers.Contract(roleNFT_CA, roleNFT_ABI, signer);

    let tx;
    if (role === "Student") {
      tx = await contract.safeMintStudent(walletAddress, process.env.STUDENT_METADATA_CID);
    } else if (role === "Company") {
      tx = await contract.safeMintCompany(walletAddress, process.env.COMPANY_METADATA_CID);
    } else {
      throw new Error("Invalid role selected");
    }

    console.log("Mint tx sent:", tx.hash);
    await tx.wait();
    return { txHash: tx.hash };

  } catch (error) {
    console.error("mintNFT error:", error);
    return null;
  }
}