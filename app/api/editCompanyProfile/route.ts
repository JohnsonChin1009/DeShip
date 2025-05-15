import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest) {
    const supabase = await createClient();
    const body = await request.json();

    const {
        name, // changed from username
        description,
        website, // changed from websiteURL
        industry,
        walletAddress,
        avatarURL, // optional
    } = body;

    try {
        // 1. Update user_profiles
        const { error: userError } = await supabase
            .from("user_profiles")
            .update({
                username: name,
                description,
                avatar_url: avatarURL,
                updated_at: new Date(),
            })
            .eq("wallet_address", walletAddress);

        if (userError) {
            console.error("Error updating user_profiles:", userError.message);
            return NextResponse.json({ status: 500, message: userError.message });
        }

        // 2. Update company_profiles
        const { error: companyError } = await supabase
            .from("company_profiles")
            .update({
                website_url: website,
                industry,
            })
            .eq("wallet_address", walletAddress);

        if (companyError) {
            console.error("Error updating company_profiles:", companyError.message);
            return NextResponse.json({ status: 500, message: companyError.message });
        }

        return NextResponse.json({
            status: 200,
            message: "Company profile updated successfully",
        });

    } catch (err) {
        console.error("Unexpected error in PATCH /edit-company-profile:", err);
        return NextResponse.json({ status: 500, message: "Server error" });
    }
}
