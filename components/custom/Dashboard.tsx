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
import { useEffect, useState, useCallback } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { weiToEth } from '@/lib/utils';
import { useUser } from '@/context/UserContext';
import { usePrivy } from "@privy-io/react-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { ethers } from 'ethers';
import { scholarship_ABI } from '@/lib/contractABI';
import Image from 'next/image';
import Link from 'next/link';
// import * as snarkjs from 'snarkjs';

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

interface ScholarshipCompany {
  id: string;
}

interface AppliedScholarship {
  id: string;
  title: string;
  status: number;
  totalAmount: string;
  remainingAmount: string;
  deadline: string;
  company: ScholarshipCompany;
}

interface ApprovedScholarship {
  id: string;
  title: string;
  status: number;
  completionPercentage: string;
  completedMilestones: number;
  totalMilestones: number;
  company?: ScholarshipCompany;
}

interface ScholarData {
  scholar: {
    appliedScholarships: AppliedScholarship[];
    approvedScholarships: ApprovedScholarship[];
    totalFundingReceived: string;
    completionPercentage: string;
  } | null;
}

const handleSubmitMilestone = async (scholarshipId: string) => {
  const contractAddress = scholarshipId;
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(contractAddress, scholarship_ABI, signer);
        const tx = await contract.completeMilestone(signer.getAddress(), 0);
        await tx.wait();

        console.log("Milestone completed successfully");
}
const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Metrics Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-24" />
              </CardTitle>
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Skeleton className="h-8 w-16 mb-1" />
              </div>
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-5 w-36" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <Skeleton className="h-[250px] w-[250px] rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-5 w-36" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex flex-col justify-between p-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-5 w-40" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-5 w-36" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-14 rounded-md" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

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
    const [avatarImages, setAvatarImages] = useState<string[]>([]);
    const [scholarUsernames, setScholarUsernames] = useState<{[address: string]: string}>({});

    useEffect(() => {
      console.log("Loading avatar images");
      setAvatarImages([
        "https://mvmkybzjlmfhuaqrtlii.supabase.co/storage/v1/object/public/profile-images//1.png",
        "https://mvmkybzjlmfhuaqrtlii.supabase.co/storage/v1/object/public/profile-images//2.png",
        "https://mvmkybzjlmfhuaqrtlii.supabase.co/storage/v1/object/public/profile-images//3.png",
        "https://mvmkybzjlmfhuaqrtlii.supabase.co/storage/v1/object/public/profile-images//4.png",
        "https://mvmkybzjlmfhuaqrtlii.supabase.co/storage/v1/object/public/profile-images//5.png",
        "https://mvmkybzjlmfhuaqrtlii.supabase.co/storage/v1/object/public/profile-images//6.png",
        "https://mvmkybzjlmfhuaqrtlii.supabase.co/storage/v1/object/public/profile-images//7.png",
        "https://mvmkybzjlmfhuaqrtlii.supabase.co/storage/v1/object/public/profile-images//8.png",
        "https://mvmkybzjlmfhuaqrtlii.supabase.co/storage/v1/object/public/profile-images//9.png",
        "https://mvmkybzjlmfhuaqrtlii.supabase.co/storage/v1/object/public/profile-images//10.png",
      ]);
    }, []);

    const fetchDashboardData = useCallback(async () => {
      try {
        if (!privyReady) {
          console.log("Privy not ready yet");
          return;
        }

        setIsLoading(true);
        
        let walletAddress;
        
        if (authenticated && privyUser?.wallet?.address) {
          walletAddress = privyUser.wallet.address;
          console.log("Using Privy wallet address:", walletAddress);
        } 
        else if (contextUser?.wallet_address) {
          walletAddress = contextUser.wallet_address;
          console.log("Using context wallet address:", walletAddress);
        } 
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
          if (response.status === 404) {
            setDashboardData({
              company: null,
              scholarPerformance: [],
              recentTransactions: [],
              activeScholars: []
            });
            setError(null);
            setIsLoading(false);
            return true;
          }
          throw new Error(`Failed to fetch dashboard data: ${response.status}`);
        }

        const data = await response.json();
        console.log("Dashboard data fetched:", data);
        
        if (!data.company) {
          setDashboardData({
            company: null,
            scholarPerformance: [],
            recentTransactions: [],
            activeScholars: []
          });
          setError(null);
          setIsLoading(false);
          return true;
        }
        
        const usernames: {[address: string]: string} = {};
        
        if (data.activeScholars && data.activeScholars.length > 0) {
          console.log("Fetching usernames for", data.activeScholars.length, "scholars");
          
          await Promise.all(data.activeScholars.map(async (scholar: Scholar) => {
            try {
              const studentResponse = await fetch('/api/fetchUserData', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  walletAddress: scholar.id,
                  role: 'Student'
                }),
              });
              
              const studentData = await studentResponse.json();
              
              if (studentResponse.ok && studentData.status === 200) {
                console.log("Fetched student data for", scholar.id, studentData.data);
                usernames[scholar.id] = studentData.data.username || `Scholar ${scholar.id.substring(0, 4)}...`;
              } else {
                console.error("Error fetching student data:", studentData.error);
                usernames[scholar.id] = `Scholar ${scholar.id.substring(0, 4)}...`;
              }
            } catch (err) {
              console.error("Error fetching student data for", scholar.id, err);
              usernames[scholar.id] = `Scholar ${scholar.id.substring(0, 4)}...`;
            }
          }));
          
          console.log("Usernames fetched:", usernames);
          setScholarUsernames(usernames);
          
          if (data.scholarPerformance && data.scholarPerformance.length > 0) {
            const updatedPerformance = data.scholarPerformance.map((perf: ScholarPerformance) => {
              return {
                ...perf,
                name: usernames[perf.name] || perf.name
              };
            });
            
            data.scholarPerformance = updatedPerformance;
          }
        }
        
        setDashboardData(data);
        setError(null);
        return true;
      } catch (err) {
        setError((err as Error).message);
        console.error('Error fetching dashboard data:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    }, [contextUser, privyUser, privyReady, authenticated]);

    useEffect(() => {
      fetchDashboardData();
    }, [fetchDashboardData]);

    const fundingDistributionData = dashboardData.company ? [
      { name: 'Released', value: weiToEth(dashboardData.company.totalFundingReleased) },
      { name: 'Remaining', value: weiToEth(dashboardData.company.totalFundingRemaining) }
    ] : [];

    if (isLoading) {
      return <DashboardSkeleton />;
    }

    if (error) {
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
      
      if (error.includes('404') || error.includes('data not found')) {
        return (
          <div className="flex justify-center items-center min-h-[300px] flex-col gap-4">
            <div className="text-amber-500 font-medium">No company data found. You may need to create a scholarship first.</div>
            <Button onClick={() => window.location.reload()} variant="outline">Refresh</Button>
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
          <Button onClick={() => window.location.reload()} variant="outline">Refresh</Button>
        </div>
      );
    }

    return (
        <div className="space-y-6">
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
                        <div>
                          <p className="font-medium text-sm">{scholarUsernames[tx.student.id] || 'Scholar'}</p>
                          <p className="text-xs text-muted-foreground">
                            {`${tx.student.id.substring(0, 4)}...${tx.student.id.substring(tx.student.id.length - 3)}`}
                          </p>
                        </div>
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
                    const username = scholarUsernames[scholar.id] || `${scholar.id.substring(0, 4)}...${scholar.id.substring(scholar.id.length - 3)}`;
                    const avatarIndex = username.charCodeAt(0) % avatarImages.length;
                    
                    return (
                      <div key={scholar.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              {avatarImages.length > 0 ? (
                                <Image
                                  width={32}
                                  height={32}
                                  src={avatarImages[avatarIndex]} 
                                  alt={username}
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <AvatarFallback>{username.substring(0, 2)}</AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium truncate max-w-[200px]">{username}</p>
                              <p className="text-sm text-muted-foreground">{scholarshipTitle}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/company/scholarship-details/${scholar.approvedScholarships?.[0]?.id || ''}`}>
                              View
                            </Link>
                          </Button>
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
    const { user: contextUser } = useUser();
    const { user: privyUser, ready: privyReady, authenticated, login } = usePrivy();
    const [dashboardData, setDashboardData] = useState<ScholarData>({
        scholar: null
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [companyNames, setCompanyNames] = useState<{[address: string]: string}>({});

    const fetchDashboardData = useCallback(async () => {
        try {
            if (!privyReady) {
                console.log("Privy not ready yet");
                return;
            }

            setIsLoading(true);
            
            let walletAddress;
            
            if (authenticated && privyUser?.wallet?.address) {
                walletAddress = privyUser.wallet.address;
                console.log("Using Privy wallet address:", walletAddress);
            } 
            else if (contextUser?.wallet_address) {
                walletAddress = contextUser.wallet_address;
                console.log("Using context wallet address:", walletAddress);
            } 
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
            
            const response = await fetch('/api/fetchStudentDashboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentAddress: walletAddress,
                }),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.log('No student data found on the server');
                    setDashboardData({
                        scholar: null
                    });
                    setError(null);
                    setIsLoading(false);
                    return true;
                }
                throw new Error(`Failed to fetch dashboard data: ${response.status}`);
            }

            const data = await response.json();
            console.log("Student dashboard data fetched:", data);
            
            if (!data.scholar) {
                setDashboardData({
                    scholar: null
                });
                setError(null);
                setIsLoading(false);
                return true;
            }
            
            // Fetch company names for each scholarship
            const companyData: {[address: string]: string} = {};
            
            if (data.scholar.appliedScholarships && data.scholar.appliedScholarships.length > 0) {
                await Promise.all(data.scholar.appliedScholarships.map(async (scholarship: AppliedScholarship) => {
                    try {
                        const companyResponse = await fetch('/api/fetchUserData', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                walletAddress: scholarship.company.id,
                                role: 'Company'
                            }),
                        });
                        
                        const companyInfo = await companyResponse.json();
                        
                        if (companyResponse.ok && companyInfo.status === 200) {
                            companyData[scholarship.company.id] = companyInfo.data.username || `Company ${scholarship.company.id.substring(0, 6)}...`;
                        } else {
                            companyData[scholarship.company.id] = `Company ${scholarship.company.id.substring(0, 6)}...`;
                        }
                    } catch (err) {
                        console.error("Error fetching company data:", err);
                        companyData[scholarship.company.id] = `Company ${scholarship.company.id.substring(0, 6)}...`;
                    }
                }));
            }
            
            setCompanyNames(companyData);
            setDashboardData({
                scholar: data.scholar
            });
            setError(null);
            return true;
        } catch (err) {
            setError((err as Error).message);
            console.error('Error fetching dashboard data:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [contextUser, privyUser, privyReady, authenticated]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Status mapping for scholarship statuses
    const statusMapping = ["Open", "In Progress", "Closed", "Completed"];

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (error) {
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
        
        if (error.includes('404') || error.includes('data not found')) {
            return (
                <div className="flex justify-center items-center min-h-[300px] flex-col gap-4">
                    <div className="text-amber-500 font-medium">No student data found. You may need to apply for a scholarship first.</div>
                    <Button onClick={() => window.location.reload()} variant="outline">Refresh</Button>
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

    if (!dashboardData.scholar) {
        return (
            <div className="flex justify-center items-center min-h-[300px] flex-col gap-4">
                <div className="text-amber-500 font-medium">No scholarship data found. You may need to apply for a scholarship first.</div>
                <Button onClick={() => window.location.reload()} variant="outline">Refresh</Button>
            </div>
        );
    }

    const { scholar } = dashboardData;
    
    if (!scholar) {
        return (
            <div className="flex justify-center items-center min-h-[300px] flex-col gap-4">
                <div className="text-amber-500 font-medium">No scholarship data found. You may need to apply for a scholarship first.</div>
                <Button onClick={() => window.location.reload()} variant="outline">Refresh</Button>
            </div>
        );
    }
    
    const { appliedScholarships = [], approvedScholarships = [] } = scholar;
    const overallCompletionPercentage = parseFloat(scholar.completionPercentage || "0");
    const totalFundingETH = weiToEth(scholar.totalFundingReceived || "0");

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Scholarships</CardTitle>
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
                        <div className="text-2xl font-bold">{appliedScholarships.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {approvedScholarships.length} approved
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Funding Received</CardTitle>
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
                            {totalFundingETH.toFixed(6)} ETH
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Across {approvedScholarships.length} approved scholarships
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overall Completion</CardTitle>
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
                            {overallCompletionPercentage.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Average across all approved scholarships
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Approved Scholarships</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {approvedScholarships.length > 0 ? (
                                approvedScholarships.map((scholarship: ApprovedScholarship) => {
                                    const companyName = scholarship.company?.id ? companyNames[scholarship.company.id] : "Unknown Company";
                                    const percentComplete = parseFloat(scholarship.completionPercentage);
                                    
                                    return (
                                        <div key={scholarship.id} className="space-y-2">
                                            <div className="flex justify-between">
            <div>
                                                    <p className="font-medium">{scholarship.title}</p>
                                                    <p className="text-sm text-muted-foreground">{companyName}</p>
            </div>
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    statusMapping[scholarship.status] === "Open" ? "bg-green-100 text-green-800" :
                                                    statusMapping[scholarship.status] === "In Progress" ? "bg-blue-100 text-blue-800" :
                                                    statusMapping[scholarship.status] === "Closed" ? "bg-yellow-100 text-yellow-800" :
                                                    "bg-gray-100 text-gray-800"
                                                }`}>
                                                    {statusMapping[scholarship.status]}
                                                </span>
                                            </div>
                                            <Progress value={percentComplete} className="h-2" />
                                            <div className="flex justify-between text-sm text-muted-foreground">
                                                <span>Progress ({scholarship.completedMilestones}/{scholarship.totalMilestones} milestones)</span>
                                                <span>{percentComplete.toFixed(1)}%</span>
                                            </div>
                                            <Button
                                              onClick={() => handleSubmitMilestone(scholarship.id)}
                                              disabled={statusMapping[scholarship.status] === "Closed"}
                                              variant={"outline"}
                                            >
                                              Submit Milestone
                                            </Button>
                                        </div>
                                    );
                                })
                            ) : (
                                <p>No approved scholarships yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Applied Scholarships</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {appliedScholarships.length > 0 ? (
                                appliedScholarships.map((scholarship: AppliedScholarship) => {
                                    const companyName = companyNames[scholarship.company.id] || "Unknown Company";
                                    const deadlineDate = new Date(parseInt(scholarship.deadline) * 1000);
                                    const totalAmount = weiToEth(scholarship.totalAmount);
                                    const remainingAmount = weiToEth(scholarship.remainingAmount);
                                    
                                    return (
                                        <div key={scholarship.id} className="flex items-center justify-between border-b pb-3">
                                            <div>
                                                <p className="font-medium">{scholarship.title}</p>
                                                <p className="text-sm text-muted-foreground">{companyName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Deadline: {format(deadlineDate, 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    statusMapping[scholarship.status] === "Open" ? "bg-green-100 text-green-800" :
                                                    statusMapping[scholarship.status] === "In Progress" ? "bg-blue-100 text-blue-800" :
                                                    statusMapping[scholarship.status] === "Closed" ? "bg-yellow-100 text-yellow-800" :
                                                    "bg-gray-100 text-gray-800"
                                                }`}>
                                                    {statusMapping[scholarship.status]}
                                                </span>
                                                <p className="text-sm font-medium mt-1">{totalAmount.toFixed(6)} ETH</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {remainingAmount.toFixed(6)} ETH remaining
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p>No applied scholarships</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

//commented dashboard with the zkproof
// const StudentDashboard = () => {
//   const handleGenerateProof = async () => {
//     const inputs = {
//       minGPA: '30',
//       maxIncome: '60000',
//       gpa: '30',
//       fieldRelevance: '70',
//       householdIncome: '40000',
//       statementScore: '80',
//     };
//     const { proof, publicSignals } = await snarkjs.groth16.fullProve(
//       inputs,
//       'main.wasm',
//       'main.groth16.zkey'
//     );

//     console.log('Proof: ');
//     console.log(JSON.stringify(proof, null, 1));
//     console.log('Public Signals: ');
//     console.log(JSON.stringify(publicSignals, null, 1));
//     console.log('Public Signals: ', publicSignals);
//   };
//   return (
//     <>
//       <div>
//         <Button onClick={() => handleGenerateProof()}>Generate zkProof</Button>
//       </div>
//     </>
//   );
// };