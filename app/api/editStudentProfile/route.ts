import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest) {
    const supabase = await createClient();
    const body = await request.json();

    const {
        name, // from username
        description,
        academicProgression, // camelCase from the form payload
        fieldOfStudy,       // camelCase from the form payload
        portfolioURL,       // camelCase from the form payload
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

        // 2. Update student_profiles - use snake_case for database fields
        const { error: studentError } = await supabase
            .from("student_profiles")
            .update({
                academic_progression: academicProgression,
                field_of_study: fieldOfStudy,
                portfolio_url: portfolioURL,
            })
            .eq("wallet_address", walletAddress);

        if (studentError) {
            console.error("Error updating student_profiles:", studentError.message);
            return NextResponse.json({ status: 500, message: studentError.message });
        }

        return NextResponse.json({
            status: 200,
            message: "Student profile updated successfully",
        });

    } catch (err) {
        console.error("Unexpected error in PATCH /edit-student-profile:", err);
        return NextResponse.json({ status: 500, message: "Server error" });
    }
} 