import { Company, Scholarship, Industry, AcademicLevel, FieldOfStudy, Location, Scholar, BlockchainTransaction } from './types';

export const mockCompanies: Company[] = [
  {
    id: 'c1',
    name: 'Blockchain Education Fund',
    description: 'Supporting the next generation of blockchain developers and innovators.',
    website: 'https://blockchaineducationfund.org',
    logo: 'https://images.unsplash.com/photo-1621501103780-437c0995c676?w=128&h=128&fit=crop',
    industry: 'Education',
    location: 'Global',
    scholarshipsPosted: 3,
    totalFunding: 150000,
    contractAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    metrics: {
      totalScholars: 45,
      activeScholars: 32,
      totalFundsAllocated: 750000,
      successRate: 89,
      roi: 15.7,
      scholarPerformance: [
        {
          id: 's1',
          name: 'Alice Johnson',
          program: 'Web3 Innovation Scholarship',
          status: 'Active',
          performance: 92,
          startDate: '2024-01-15',
          milestones: {
            completed: 7,
            total: 10
          }
        },
        {
          id: 's2',
          name: 'Bob Smith',
          program: 'DeFi Development Grant',
          status: 'Completed',
          performance: 88,
          startDate: '2023-09-01',
          endDate: '2024-03-01',
          milestones: {
            completed: 10,
            total: 10
          }
        }
      ],
      fundingHistory: [
        {
          date: '2024-01-01',
          amount: 50000,
          type: 'Allocation',
          program: 'Web3 Innovation Scholarship'
        },
        {
          date: '2024-02-01',
          amount: 75000,
          type: 'Return',
          program: 'DeFi Development Grant'
        }
      ],
      geographicDistribution: [
        {
          region: 'North America',
          scholars: 15,
          funding: 300000
        },
        {
          region: 'Europe',
          scholars: 12,
          funding: 240000
        },
        {
          region: 'Asia',
          scholars: 18,
          funding: 360000
        }
      ]
    }
  },
  {
    id: 'c2',
    name: 'Ethereum Foundation',
    description: 'Promoting and supporting Ethereum ecosystem development.',
    website: 'https://ethereum.foundation',
    logo: 'https://images.unsplash.com/photo-1622473590773-f588134b6ce7?w=128&h=128&fit=crop',
    industry: 'Infrastructure',
    location: 'Global',
    scholarshipsPosted: 5,
    totalFunding: 500000,
    contractAddress: '0x9A67F1940164d0318612b497E8e6038f902a00a4'
  }
];

export const mockScholarships: Scholarship[] = [
  {
    id: 1,
    companyId: 'c1',
    title: 'Web3 Innovation Scholarship',
    organization: 'Blockchain Education Fund',
    amount: 50000,
    deadline: '2024-05-15',
    description: 'Supporting the next generation of blockchain developers and innovators with a focus on decentralized applications and smart contract development.',
    eligibility: {
      gpa: 3.5,
      fieldOfStudy: ['Computer Science', 'Engineering'],
      academicLevel: 'Undergraduate',
      skills: ['Solidity', 'JavaScript', 'React'],
      location: 'Global',
      additionalRequirements: 'Must have completed at least one blockchain project'
    },
    status: 'Active',
    applicants: 156,
    contractAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    progress: 65,
    selectedScholars: 8,
    totalSlots: 10
  },
  {
    id: 2,
    companyId: 'c2',
    title: 'DeFi Research Grant',
    organization: 'Ethereum Foundation',
    amount: 75000,
    deadline: '2024-06-30',
    description: 'Research grant for innovative projects in decentralized finance, focusing on scalability and security solutions.',
    eligibility: {
      gpa: 3.7,
      fieldOfStudy: ['Computer Science', 'Mathematics', 'Economics'],
      academicLevel: 'Graduate',
      skills: ['DeFi', 'Smart Contracts', 'Cryptography'],
      location: 'Global',
      additionalRequirements: 'Published research in blockchain or cryptography preferred'
    },
    status: 'Active',
    applicants: 89,
    contractAddress: '0x9A67F1940164d0318612b497E8e6038f902a00a4',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    progress: 45,
    selectedScholars: 5,
    totalSlots: 15
  }
];

export const mockScholars: Scholar[] = [
  {
    id: 's1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    program: 'Web3 Innovation Scholarship',
    status: 'Active',
    performance: 92,
    startDate: '2024-01-15',
    walletAddress: '0x1234...5678',
    totalFunding: 50000,
    milestones: {
      completed: 7,
      total: 10
    }
  },
  {
    id: 's2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    program: 'DeFi Development Grant',
    status: 'Completed',
    performance: 88,
    startDate: '2023-09-01',
    endDate: '2024-03-01',
    walletAddress: '0x5678...9012',
    totalFunding: 75000,
    milestones: {
      completed: 10,
      total: 10
    }
  }
];

export const mockTransactions: BlockchainTransaction[] = [
  {
    hash: '0xabcd...1234',
    type: 'Funding',
    amount: 50000,
    timestamp: '2024-01-15T10:00:00Z',
    status: 'Confirmed',
    from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    to: '0x1234...5678',
    gas: 0.005
  },
  {
    hash: '0xefgh...5678',
    type: 'Disbursement',
    amount: 25000,
    timestamp: '2024-02-15T10:00:00Z',
    status: 'Confirmed',
    from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    to: '0x5678...9012',
    gas: 0.003
  }
];

export const industries: Industry[] = [
  'Blockchain',
  'DeFi',
  'Web3',
  'NFT',
  'Gaming',
  'Infrastructure',
  'Privacy',
  'Security',
  'Research',
  'Education',
  'Other'
];

export const academicLevels: AcademicLevel[] = [
  'Undergraduate',
  'Graduate',
  'PhD',
  'Postdoctoral'
];

export const fieldsOfStudy: FieldOfStudy[] = [
  'Computer Science',
  'Engineering',
  'Business',
  'Mathematics',
  'Economics',
  'Environmental Science',
  'Finance',
  'Other'
];

export const locations: Location[] = [
  'Global',
  'North America',
  'Europe',
  'Asia',
  'Africa',
  'South America'
];