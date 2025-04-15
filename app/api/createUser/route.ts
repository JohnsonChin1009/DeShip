import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    
    const {role, ...userData} = body;

    let result;

    // Guard for Invalid Role
    if (role != "student" && role != "company") {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (role === "student") {
        result = await supabase.from("StudentProfile").insert(userData);
    }

    if (role === "company") {
        result = await supabase.from("CompanyProfile").insert(userData);
    }

    if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })

}