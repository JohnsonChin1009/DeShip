import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { roleNFT_CA, roleNFT_ABI } from "@/lib/roleNFT";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const targetWalletAddress = body.walletAddress;
        const roleSelected = body.role;

        if (!targetWalletAddress || !roleSelected) {
            return NextResponse.json({ error: "Missing wallet address or role" }, { status: 400 });
        }

        // 1. Setup Provider and Signer (Backend Wallet)
        const provider = new ethers.JsonRpcProvider("https://sepolia-rpc.scroll.io/");
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider); // Ensure PRIVATE_KEY is in your .env file

        // 2. Connect contract with Signer (to send transactions)
        const contract = new ethers.Contract(roleNFT_CA, roleNFT_ABI, signer);

        let tx;
        if (roleSelected === "Student") {
            tx = await contract.safeMintStudent(targetWalletAddress, process.env.STUDENT_METADATA_CID);
        } else if (roleSelected === "Company") {
            tx = await contract.safeMintCompany(targetWalletAddress, process.env.COMPANY_METADATA_CID);
        } else {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        console.log("Transaction sent:", tx.hash);
        await tx.wait(); // Wait for confirmation

        return NextResponse.json({ success: true, txHash: tx.hash }, { status: 200 });

    } catch (error: unknown) {
        console.error("Transaction error:", error);
        return NextResponse.json({ error: "Transaction failed" }, { status: 500 });
    }
}
