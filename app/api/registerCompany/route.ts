import { NextResponse } from 'next/server';
import connectDB from '@/config/mongodb';
import { CompanyModel } from '@/backend/models/Company';

export async function POST(request: Request) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get request body
    const body = await request.json();
    const { 
      name, 
      description, 
      website, 
      logo, 
      industry, 
      location, 
      walletAddress, 
      agreeToTerms 
    } = body;

    // Validate required fields
    if (!name || !description || !website || !industry || !location || !walletAddress) {
      return NextResponse.json(
        { error: 'All fields are required (name, description, website, industry, location, walletAddress)' },
        { status: 400 }
      );
    }

    // Check if terms are agreed to
    if (!agreeToTerms) {
      return NextResponse.json(
        { error: 'You must agree to the terms of service and privacy policy' },
        { status: 400 }
      );
    }

    // Check if company already exists with same contract address
    const existingCompany = await CompanyModel.findOne({ walletAddress });
    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company with this wallet address already exists' },
        { status: 400 }
      );
    }

    // Create new company
    const company = {
      name,
      description,
      website,
      logo: logo || '',
      industry,
      location,
      walletAddress,
      scholarshipsPosted: 0,
      totalFunding: 0,
      createdAt: new Date().toISOString()
    };

    const newCompany = await CompanyModel.create(company);

    return NextResponse.json(
      { message: 'Company registered successfully', company: newCompany },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}