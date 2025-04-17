import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mintNFTtoUser } from "@/lib/helper/mintRoleNFT";

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const body = await request.json();

    try {
        const { data, error } = await supabase.from("user_profiles").insert([
            {
                wallet_address: body.walletAddress,
                username: body.username,
                description: body.bio,
                avatar_url: undefined,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]).select();
    
        if (error) {
            console.error("Error Creating User", error.message);
            return NextResponse.json({ status: 500, message: error.message });
        }

        // Add additional user data and mint NFT
        try {
            if (body.role === "Student") {
                const { data, error } = await supabase.from("student_profiles").insert([
                    {
                        wallet_address: body.walletAddress,
                        field_of_study: body.fieldOfStudy,
                        academic_progression: body.academicProgression,
                        portfolioURL: body.portfolioURL || null,
                    }
                ])

                if (error) {
                    console.error("Error Inserting Student Profile", error.message);
                    return NextResponse.json({ status: 500, message: error.message });
                }

                if (data) {
                    const mintNFTResponse = await mintNFTtoUser(body.walletAddress, body.role);
                    if (!mintNFTResponse) {
                        return NextResponse.json({ status: 500, message: "Error minting NFT for Student" });
                    }
                }
            } else if (body.role === "Company") {
                const { data, error } = await supabase.from("company_profiles").insert([
                    {
                        wallet_address: body.walletAddress,
                        website_urL: body.websiteURL,
                        industry: body.industry,
                    }
                ])

                if (error) {
                    console.error("Error Inserting Company Profile", error.message);
                    return NextResponse.json({ status: 500, message: error.message });
                }

                if (data) {
                    const mintNFTResponse = await mintNFTtoUser(body.walletAddress, body.role);
                    if (!mintNFTResponse) {
                        return NextResponse.json({ status: 500, message: "Error minting NFT for Company" });
                    }
                }
            }
        } catch (error) {
            console.error("Error inserting additional data and minting NFT:", error);
            return NextResponse.json({ status: 500, message: "Error minting NFT" });
        }

        return NextResponse.json({
            message: "User created successfully",
            data: data,
        });

    } catch (error: unknown) {
        console.error("Error creating user", error);
        return NextResponse.error();
    }
}