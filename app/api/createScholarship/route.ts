import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  try { 
  return NextResponse.json({success: true, data: body}, { status: 200 })
 
  } catch (error) {
    console.error('Error creating scholarship:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}