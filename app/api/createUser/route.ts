import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mintNFTtoUser } from "@/lib/helper/mintRoleNFT";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  try {
    // 1. Create user profile
    const { error: userError } = await supabase.from("user_profiles").insert([
      {
        wallet_address: body.walletAddress,
        username: body.username,
        description: body.bio,
        avatar_url: undefined,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    if (userError) {
      console.error("Error creating user:", userError.message);
      return NextResponse.json({ status: 500, message: userError.message });
    }

    // 2. Create specific role profile
    let roleProfileError = null;

    if (body.role === "Student") {
      const { error } = await supabase.from("student_profiles").insert([
        {
          wallet_address: body.walletAddress,
          field_of_study: body.fieldOfStudy,
          academic_progression: body.academicProgression,
          portfolio_url: body.portfolioURL || null,
        },
      ]);
      roleProfileError = error;
    } else if (body.role === "Company") {
      const { error } = await supabase.from("company_profiles").insert([
        {
          wallet_address: body.walletAddress,
          website_url: body.websiteURL,
          industry: body.industry,
        },
      ]);
      roleProfileError = error;
    }

    if (roleProfileError) {
      console.error("Error creating role-specific profile:", roleProfileError.message);
      return NextResponse.json({ status: 500, message: roleProfileError.message });
    }

    // 3. Mint NFT for the user
    const mintResult = await mintNFTtoUser(body.walletAddress, body.role);
    if (!mintResult) {
      console.error("NFT minting failed");
      return NextResponse.json({ status: 500, message: "NFT minting failed" });
    }

    console.log("NFT minted successfully:", mintResult.txHash);

    // 4. Done!
    return NextResponse.json({
      status: 200,
      message: "User created and NFT minted successfully",
      txHash: mintResult.txHash,
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ status: 500, message: "Server error" });
  }
}