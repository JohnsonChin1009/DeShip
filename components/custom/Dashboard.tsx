"use client";

import { format } from 'date-fns';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { weiToEth } from '@/lib/utils';
import { useUser } from '@/context/UserContext';
import { usePrivy } from "@privy-io/react-auth";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface DashboardSectionProps {
    role: string;
}

export default function DashboardSection({ role }: DashboardSectionProps) {
    const dashboard = role === "Company" ? <CompanyDashboard /> : <StudentDashboard />;

    return (
        <div>
            {dashboard}
        </div>
    )
}

interface CompanyData {
  id: string;
  totalScholarships: number;
  totalFunding: string;
  totalFundingReleased: string;
  totalFundingRemaining: string;
  totalApprovedScholars: number;
  totalActiveScholars: number;
}

interface ScholarPerformance {
  name: string;
  performance: number;
}

interface Transaction {
  id: string;
  scholarship: {
    id: string;
    title: string;
  };
  student: {
    id: string;
  };
  milestone: {
    title: string;
  };
  amount: string;
  blockTimestamp: string;
  transactionHash: string;
}

interface Scholar {
  id: string;
  completionPercentage: string;
  totalFundingReceived: string;
  appliedScholarships: {
    id: string;
    title: string;
  }[];
  approvedScholarships: {
    id: string;
    title: string;
    totalAmount: string;
    completionPercentage: string;
  }[];
}

interface DashboardData {
  company: CompanyData | null;
  scholarPerformance: ScholarPerformance[];
  recentTransactions: Transaction[];
  activeScholars: Scholar[];
}

const CompanyDashboard = () => {
    const { user: contextUser } = useUser();
    const { user: privyUser, ready: privyReady, authenticated, login } = usePrivy();
    const [dashboardData, setDashboardData] = useState<DashboardData>({
      company: null,
      scholarPerformance: [],
      recentTransactions: [],
      activeScholars: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchDashboardData = async () => {
        try {
          if (!privyReady) {
            // Wait for Privy to be ready
            return;
          }

          // Get wallet address from Privy, user context, or localStorage as fallback
          let walletAddress;
          
          // First priority: Privy authenticated wallet
          if (authenticated && privyUser?.wallet?.address) {
            walletAddress = privyUser.wallet.address;
            console.log("Using Privy wallet address:", walletAddress);
          } 
          // Second priority: User context
          else if (contextUser?.wallet_address) {
            walletAddress = contextUser.wallet_address;
            console.log("Using context wallet address:", walletAddress);
          } 
          // Last resort: Try localStorage
          else {
            try {
              walletAddress = typeof window !== 'undefined' ? localStorage.getItem("walletAddress") : null;
              console.log("Using localStorage wallet address:", walletAddress);
            } catch (error) {
              console.error("Error accessing localStorage:", error);
            }
          }
          
          if (!walletAddress) {
            console.warn('No wallet address found');
            setError("No wallet address found. Please connect your wallet.");
            setIsLoading(false);
            return;
          }
          
          const response = await fetch('/api/fetchCompanyDashboard', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              companyAddress: walletAddress,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
          }

          const data = await response.json();
          setDashboardData(data);
        } catch (err) {
          setError((err as Error).message);
          console.error('Error fetching dashboard data:', err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDashboardData();
    }, [contextUser, privyUser, privyReady, authenticated]);

    // Prepare funding distribution data for pie chart
    const fundingDistributionData = dashboardData.company ? [
      { name: 'Released', value: weiToEth(dashboardData.company.totalFundingReleased) },
      { name: 'Remaining', value: weiToEth(dashboardData.company.totalFundingRemaining) }
    ] : [];

    if (isLoading) {
      return <div className="flex justify-center items-center min-h-[300px]">Loading dashboard data...</div>;
    }

    if (error) {
      // Special case for when no wallet address is found
      if (error === "No wallet address found. Please connect your wallet.") {
        return (
          <div className="flex justify-center items-center min-h-[300px] flex-col gap-4">
            <div className="text-amber-500 font-medium">No wallet address found</div>
            <Button 
              onClick={() => privyUser ? window.location.reload() : authenticated ? window.location.reload() : login()} 
              variant="default"
            >
              Connect Wallet
            </Button>
          </div>
        );
      }
      
      return (
        <div className="flex justify-center items-center min-h-[300px] flex-col gap-4">
          <div className="text-red-500 font-medium">Error: {error}</div>
          <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
        </div>
      );
    }

    const { company, scholarPerformance, recentTransactions, activeScholars } = dashboardData;
    console.log("Company Data:", company);

    if (!company) {
      return (
        <div className="flex justify-center items-center min-h-[300px] flex-col gap-4">
          <div className="text-amber-500 font-medium">No company data found. You may need to create a scholarship first.</div>
        </div>
      );
    }

    return (
        <div className="space-y-6">
        {/* Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Scholars</CardTitle>
                <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
                >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{company.totalApprovedScholars}</div>
                <p className="text-xs text-muted-foreground">
                {company.totalActiveScholars} currently active
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Funding</CardTitle>
                <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
                >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                {weiToEth(company.totalFunding).toFixed(6)} ETH
                </div>
                <p className="text-xs text-muted-foreground">
                Across {company.totalScholarships} programs
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
                >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                  {company.totalApprovedScholars > 0 
                    ? ((weiToEth(company.totalFundingReleased) / weiToEth(company.totalFunding)) * 100).toFixed(1) 
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                Funds disbursement rate
                </p>
            </CardContent>
            </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
            <CardHeader>
                <CardTitle>Funding Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={fundingDistributionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                    >
                        {fundingDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${Number(value).toFixed(6)} ETH`} />
                    </PieChart>
                </ResponsiveContainer>
                </div>
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>Scholar Performance</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scholarPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="performance" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </CardContent>
            </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{tx.milestone.title} - {tx.scholarship.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(parseInt(tx.blockTimestamp) * 1000), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{weiToEth(tx.amount).toFixed(6)} ETH</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[150px]">To: {`${tx.student.id.substring(0, 4)}...${tx.student.id.substring(tx.student.id.length - 3)}`}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No recent transactions</p>
                )}
                </div>
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>Active Scholars</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                {activeScholars.length > 0 ? (
                  activeScholars.map((scholar) => {
                    const scholarshipTitle = scholar.approvedScholarships?.[0]?.title || "Unknown Program";
                    const performanceValue = parseFloat(scholar.completionPercentage);
                    
                    return (
                      <div key={scholar.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{scholar.id.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium truncate max-w-[200px]">{`${scholar.id.substring(0, 4)}...${scholar.id.substring(scholar.id.length - 3)}`}</p>
                              <p className="text-sm text-muted-foreground">{scholarshipTitle}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                        <Progress value={performanceValue} className="h-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Performance</span>
                          <span>{performanceValue.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>No active scholars</p>
                )}
                </div>
            </CardContent>
            </Card>
        </div>
        </div>
    );
}

const StudentDashboard = () => {
    return (
        <>
            <div>
                Student Dashboard
            </div>
        </>
    )
}