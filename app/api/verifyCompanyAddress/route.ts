import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { scholarshipFactory_CA, scholarshipFactory_ABI } from "@/lib/contractABI";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const walletAddress = body.walletAddress;

        if (!walletAddress) {
            return NextResponse.json({ error: "Missing wallet address" }, { status: 400 });
        }

        // 1. Setup Provider and Signer (Backend Wallet with admin privileges)
        const provider = new ethers.JsonRpcProvider("https://sepolia-rpc.scroll.io/");
        const signer = new ethers.Wallet(process.env.METAMASK_PRIVATE_KEY!, provider); // Ensure METAMASK_PRIVATE_KEY is in your .env file

        // 2. Connect to ScholarshipFactory contract with admin Signer
        const scholarshipFactory = new ethers.Contract(scholarshipFactory_CA, scholarshipFactory_ABI, signer);

        // 3. Check if address is already verified
        const isVerified = await scholarshipFactory.checkVerifiedAddress(walletAddress);
        
        if (isVerified) {
            return NextResponse.json({ 
                success: true, 
                message: "Address already verified",
                isVerified: true
            }, { status: 200 });
        }

        // 4. Verify the company address
        const tx = await scholarshipFactory.verifyAddress(walletAddress);
        console.log("Verification transaction sent:", tx.hash);
        
        // 5. Wait for confirmation
        await tx.wait();

        return NextResponse.json({ 
            success: true, 
            message: "Address verified successfully",
            txHash: tx.hash,
            isVerified: true
        }, { status: 200 });

    } catch (error: unknown) {
        console.error("Verification error:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ 
            error: "Verification failed", 
            message: errorMessage 
        }, { status: 500 });
    }
} 