import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { studentAddress } = body;

        if (!studentAddress) {
            return NextResponse.json({ error: "Student address is required" }, { status: 400 });
        }

        const graphqlEndpoint = "https://api.studio.thegraph.com/query/105145/de-ship/version/latest";
        
        const query = `
            query GetStudentDashboard($studentAddress: Bytes!) {
                scholar(id: $studentAddress) {
                    appliedScholarships {
                        id
                        title
                        status
                        totalAmount
                        remainingAmount
                        deadline
                        company {
                            id
                        }
                    }
                    approvedScholarships {
                        id
                        title
                        status
                        completionPercentage
                        completedMilestones
                        totalMilestones
                        company {
                            id
                        }
                    }
                    totalFundingReceived
                    completionPercentage
                }
            }
        `;

        const variables = {
            studentAddress: studentAddress.toLowerCase()
        };

        const response = await fetch(graphqlEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        });

        if (!response.ok) {
            console.error(`GraphQL request failed with status ${response.status}`);
            return NextResponse.json({ error: "Failed to fetch data from The Graph" }, { status: 500 });
        }

        const data = await response.json();
        
        if (data.errors) {
            console.error("GraphQL Errors:", data.errors);
            return NextResponse.json({ error: "GraphQL errors", details: data.errors }, { status: 500 });
        }

        if (!data.data.scholar) {
            return NextResponse.json({ scholar: null }, { status: 200 });
        }

        return NextResponse.json(data.data, { status: 200 });
    } catch (error) {
        console.error("Unexpected error in fetchStudentDashboard:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
} 