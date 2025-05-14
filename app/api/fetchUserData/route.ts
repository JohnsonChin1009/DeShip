import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const supabase = await createClient();

    const walletAddress = body.walletAddress;
    const role = body.role;

    // Validate that wallet address and role is provided
    if (!walletAddress || !role) return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });

    try {
        // Query data from user_profiles table
        const { data: userData, error: userError } = await supabase.from("user_profiles").select("*").eq("wallet_address", walletAddress).single();

        if (userError || !userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let profileData;

        if (role === "Student") {
            const { data: studentData, error: studentError } = await supabase.from("student_profiles").select("*").eq("wallet_address", walletAddress).single();

            if (studentError || !studentData) {
                return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
            }

            profileData = studentData;
        }

        if (role === "Company") {
            const { data: companyData, error: companyError } = await supabase.from("company_profiles").select("*").eq("wallet_address", walletAddress).single();
            console.log("Company data:", companyData);
            console.log("Company that has log in: ", walletAddress);

            if (companyError || !companyData) {
                return NextResponse.json({ error: "Company profile not found" }, { status: 404 });
            }

            profileData = companyData;
        }

        return NextResponse.json({
            status: 200,
            data: {...userData, ...profileData}
        });
    } catch (error) {
        console.error("Error parsing request body:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}