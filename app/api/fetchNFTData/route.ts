import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    
  } catch (error) {
    console.error("Error occured", error);
    return NextResponse.json("")
  }
}
