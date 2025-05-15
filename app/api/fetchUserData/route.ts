import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const supabase = await createClient();

    let walletAddress = body.walletAddress;
    const role = body.role;

    // Validate that wallet address and role is provided
    if (!walletAddress || !role) return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });

    walletAddress = walletAddress.toLowerCase();
    console.log(`Searching for wallet address (normalized): ${walletAddress}`);

    try {
        // Query data from user_profiles table with case-insensitive comparison
        const { data: userData, error: userError } = await supabase
            .from("user_profiles")
            .select("*")
            .ilike("wallet_address", walletAddress)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let profileData;

        if (role === "Student") {
            const { data: studentData, error: studentError } = await supabase
                .from("student_profiles")
                .select("*")
                .ilike("wallet_address", walletAddress)
                .single();

            if (studentError || !studentData) {
                console.log(`Student profile not found for wallet: ${walletAddress}`);
                return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
            }

            profileData = studentData;
        }

        if (role === "Company") {
            const { data: companyData, error: companyError } = await supabase
                .from("company_profiles")
                .select("*")
                .ilike("wallet_address", walletAddress)
                .single();
                
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
        console.error("Error processing request:", error);
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
    const walletAddresses = studentProfiles.map(profile => profile.wallet_address.toLowerCase());
    
    // Query detailed information by joining user_profiles data
    // Note: We need to use ilike for each address separately since 'in' is case-sensitive
    let query = supabase.from("user_profiles").select("*");
    
    // Chain multiple ilike queries to make a case-insensitive 'in' equivalent
    walletAddresses.forEach(address => {
      query = query.or(`wallet_address.ilike.${address}`);
    });
    
    const { data: studentData, error: userError } = await query;
    
    if (userError) {
      console.error("Error fetching user profiles:", userError.message);
      return NextResponse.json({ error: "Error fetching user details" }, { status: 500 });
    }
    
    // Get detailed student profiles using the same case-insensitive approach
    let detailQuery = supabase.from("student_profiles").select("*");
    
    walletAddresses.forEach(address => {
      detailQuery = detailQuery.or(`wallet_address.ilike.${address}`);
    });
    
    const { data: detailedStudentProfiles, error: detailError } = await detailQuery;
    
    if (detailError) {
      console.error("Error fetching detailed student profiles:", detailError.message);
      return NextResponse.json({ error: "Error fetching student details" }, { status: 500 });
    }
    
    // Combine user profiles with student-specific data
    const combinedData = studentData.map(user => {
      // Case-insensitive find
      const studentDetails = detailedStudentProfiles.find(
        profile => profile.wallet_address.toLowerCase() === user.wallet_address.toLowerCase()
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