import { NextResponse } from "next/server";

const GRAPH_API_URL = "https://api.studio.thegraph.com/query/105145/de-ship/version/latest";

interface Scholarship {
  approvedScholars: {
    id: string;
    completedMilestones: number;
    totalMilestones: number;
    completionPercentage: string;
    milestones: {
      title: string;
      milestoneId: string;
      completedAt: string;
    }[];
  }[];
}

export async function POST(request: Request) {
  try {
    const { companyAddress } = await request.json();
    
    if (!companyAddress) {
      return NextResponse.json({ error: "Company address is required" }, { status: 400 });
    }

    // Convert address to lowercase for The Graph API
    const normalizedAddress = companyAddress.toLowerCase();

    try {
      // Fetch company dashboard data
      const companyData = await fetchCompanyData(normalizedAddress);
      
      if (!companyData) {
        return NextResponse.json({ 
          error: "Company not found",
          company: null,
          scholarPerformance: [],
          recentTransactions: [],
          activeScholars: []
        }, { status: 404 });
      }
      
      // Fetch scholar performance data
      const scholarPerformance = await fetchScholarPerformance(normalizedAddress);
      
      // Fetch recent transactions
      const recentTransactions = await fetchRecentTransactions(normalizedAddress, 5);
      
      // Fetch active scholars
      const activeScholars = await fetchActiveScholars(normalizedAddress);

      return NextResponse.json({
        company: companyData,
        scholarPerformance,
        recentTransactions,
        activeScholars
      });
    } catch (error) {
      console.error("Error fetching data from The Graph API:", error);
      return NextResponse.json({ 
        error: "Failed to fetch data from The Graph API",
        errorDetails: (error as Error).message,
        company: null,
        scholarPerformance: [],
        recentTransactions: [],
        activeScholars: []
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
  }
}

async function fetchCompanyData(companyAddress: string) {
  const query = `
    query GetCompanyDashboard($companyAddress: ID!) {
      company(id: $companyAddress) {
        id
        totalScholarships
        totalFunding
        totalFundingReleased
        totalFundingRemaining
        totalApprovedScholars
        totalActiveScholars
      }
    }
  `;

  const response = await fetch(GRAPH_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { companyAddress }
    })
  });

  const data = await response.json();
  return data.data.company;
}

async function fetchScholarPerformance(companyAddress: string) {
  const query = `
    query GetScholarPerformance($companyAddress: ID!) {
      company(id: $companyAddress) {
        scholarships {
          approvedScholars {
            id
            completedMilestones
            totalMilestones
            completionPercentage
            milestones(where: {isCompleted: true}) {
              title
              milestoneId
              completedAt
            }
          }
        }
      }
    }
  `;

  const response = await fetch(GRAPH_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { companyAddress }
    })
  });

  const data = await response.json();
  
  // Format the data for the bar chart
  const scholars = data.data.company?.scholarships?.flatMap((s: Scholarship) => s.approvedScholars) || [];
  
  return scholars.map((scholar: {
    id: string;
    completionPercentage: string;
  }) => ({
    name: scholar.id,
    performance: parseFloat(scholar.completionPercentage)
  }));
}

async function fetchRecentTransactions(companyAddress: string, limit: number) {
  const query = `
    query GetRecentTransactions($companyAddress: ID!, $limit: Int!) {
      transactions(
        where: {scholarship_: {company: $companyAddress}}
        orderBy: blockTimestamp
        orderDirection: desc
        first: $limit
      ) {
        id
        scholarship {
          id
          title
        }
        student {
          id
        }
        milestone {
          title
        }
        amount
        blockTimestamp
        transactionHash
      }
    }
  `;

  const response = await fetch(GRAPH_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { companyAddress, limit }
    })
  });

  const data = await response.json();
  return data.data.transactions || [];
}

async function fetchActiveScholars(companyAddress: string) {
  const query = `
    query GetActiveScholars($companyAddress: ID!) {
      scholarships(where: {company: $companyAddress, status: 1}) {
        approvedScholars(where: {isActive: true}) {
          id
          completionPercentage
          totalFundingReceived
          appliedScholarships {
            id
            title
          }
          approvedScholarships {
            id
            title
            totalAmount
            completionPercentage
          }
        }
      }
    }
  `;

  const response = await fetch(GRAPH_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { companyAddress }
    })
  });

  const data = await response.json();
  return data.data.scholarships?.flatMap((s: { approvedScholars: Array<{
    id: string;
    completionPercentage: string;
    totalFundingReceived: string;
    appliedScholarships: Array<{
      id: string;
      title: string;
    }>;
    approvedScholarships: Array<{
      id: string;
      title: string;
      totalAmount: string;
      completionPercentage: string;
    }>;
  }> }) => s.approvedScholars) || [];
} 