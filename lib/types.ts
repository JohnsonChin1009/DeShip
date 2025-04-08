import { StringValidation } from "zod";

export interface Company {
    id: string;
    name: string;
    description: string;
    website: string;
    logo: string;
    industry: string;
    location: string;
    scholarshipsPosted: number;
    totalFunding: number;
    contractAddress: string;
    metrics?: CompanyMetrics;
  }

export interface CompanyMetrics {
    totalScholars: number;
    activeScholars: number;
    totalFundsAllocated: number;
    successRate: number;
    roi: number;
    scholarPerformance: ScholarPerformance[];
    fundingHistory: FundingHistory[];
    geographicDistribution: GeographicDistribution[];
  }
  
export interface ScholarPerformance {
    id: string;
    name: string;
    program: string;
    status: 'Active' | 'Completed' | 'Terminated';
    performance: number;
    startDate: string;
    endDate?: string;
    milestones: {
      completed: number;
      total: number;
    };
  }
  
export interface FundingHistory {
    date: string;
    amount: number;
    type: 'Allocation' | 'Return';
    program: string;
}
  
export interface GeographicDistribution {
    region: string;
    scholars: number;
    funding: number;
}
  
export interface Scholarship {
    id: number;
    companyId: string;
    title: string;
    organization: string;
    amount: number;
    deadline: string;
    description: string;
    eligibility: {
      gpa: number;
      fieldOfStudy: string[];
      academicLevel: string;
      skills: string[];
      location: string;
      additionalRequirements: string;
};
    status: 'Active' | 'Closed' | 'Draft';
    applicants: number;
    contractAddress: string;
    createdAt: string;
    updatedAt: string;
    progress?: number;
    selectedScholars?: number;
    totalSlots?: number;
}
  
  export type Industry = 
    | 'Blockchain'
    | 'DeFi'
    | 'Web3'
    | 'NFT'
    | 'Gaming'
    | 'Infrastructure'
    | 'Privacy'
    | 'Security'
    | 'Research'
    | 'Education'
    | 'Other';
  
  export type AcademicLevel = 
    | 'Undergraduate'
    | 'Graduate'
    | 'PhD'
    | 'Postdoctoral';
  
  export type FieldOfStudy =
    | 'Computer Science'
    | 'Engineering'
    | 'Business'
    | 'Mathematics'
    | 'Economics'
    | 'Environmental Science'
    | 'Finance'
    | 'Other';
  
  export type Location =
    | 'Global'
    | 'North America'
    | 'Europe'
    | 'Asia'
    | 'Africa'
    | 'South America';
  
  export interface BlockchainTransaction {
    hash: string;
    type: 'Funding' | 'Disbursement' | 'Return';
    amount: number;
    timestamp: string;
    status: 'Confirmed' | 'Pending';
    from: string;
    to: string;
    gas: number;
  }
  
  export interface Scholar {
    id: string;
    name: string;
    email: string;
    program: string;
    status: 'Active' | 'Completed' | 'Terminated';
    performance: number;
    startDate: string;
    endDate?: string;
    walletAddress: string;
    totalFunding: number;
    milestones: {
      completed: number;
      total: number;
    };
  }