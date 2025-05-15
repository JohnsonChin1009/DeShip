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


// GET endpoint to fetch all students
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  try {
    // Query user_profiles that have corresponding student_profiles
    const { data: studentProfiles, error: studentError } = await supabase
      .from("student_profiles")
      .select("wallet_address");
    
    if (studentError) {
      console.error("Error fetching student profiles:", studentError.message);
      return NextResponse.json({ error: "Error fetching students" }, { status: 500 });
    }
    
    if (!studentProfiles || studentProfiles.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }
    
    // Get wallet addresses of all students
    const walletAddresses = studentProfiles.map(profile => profile.wallet_address);
    
    // Query detailed information by joining user_profiles data
    const { data: studentData, error: userError } = await supabase
      .from("user_profiles")
      .select("*")
      .in("wallet_address", walletAddresses);
    
    if (userError) {
      console.error("Error fetching user profiles:", userError.message);
      return NextResponse.json({ error: "Error fetching user details" }, { status: 500 });
    }
    
    // Get detailed student profiles
    const { data: detailedStudentProfiles, error: detailError } = await supabase
      .from("student_profiles")
      .select("*")
      .in("wallet_address", walletAddresses);
    
    if (detailError) {
      console.error("Error fetching detailed student profiles:", detailError.message);
      return NextResponse.json({ error: "Error fetching student details" }, { status: 500 });
    }
    
    // Combine user profiles with student-specific data
    const combinedData = studentData.map(user => {
      const studentDetails = detailedStudentProfiles.find(
        profile => profile.wallet_address === user.wallet_address
      );
      
      return {
        ...user,
        ...studentDetails,
        role: "Student" // Add role explicitly for frontend use
      };
    });
    
    return NextResponse.json({
      status: 200,
      data: combinedData
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}