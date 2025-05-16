"use client";

import ScholarshipCard from "@/components/custom/ScholarshipCard";
import {
  scholarshipFactory_ABI,
  scholarshipFactory_CA,
  scholarship_ABI,
} from "@/lib/contractABI";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Skeleton } from "@/components/ui/skeleton";

const statusMapping = ["Open", "In Progress", "Closed", "Completed"];

interface ScholarshipData {
  address: string;
  title: string;
  company: string;
  totalAmount: string;
  deadline: string;
  status: string;
  minGPA: number;
}

const ScholarshipCardSkeleton = () => {
  return (
    <div className="border border-gray-200 rounded-lg shadow-md bg-white overflow-hidden mb-4">
      <div className="p-1 bg-gradient-to-r from-gray-300 to-gray-400"></div>
      
      <div className="p-5">
        {/* Header with title and status */}
        <div className="flex justify-between items-start mb-4">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        
        {/* Amount */}
        <div className="mb-4">
          <Skeleton className="h-8 w-1/2 mb-1" />
          <Skeleton className="h-4 w-40" />
        </div>
        
        {/* Info grid */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-5 w-1/2" />
          </div>
          
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-5 w-2/3" />
          </div>
          
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        </div>
        
        {/* Apply button */}
        <div className="flex justify-end mt-4">
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
};

export default function DiscoverScholarshipSection() {
  const [scholarships, setScholarships] = useState<ScholarshipData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScholarships = async () => {
      setIsLoading(true);
      const provider = new ethers.JsonRpcProvider("https://sepolia-rpc.scroll.io/");
      const factory = new ethers.Contract(
        scholarshipFactory_CA,
        scholarshipFactory_ABI,
        provider
      );

      try {
        const addresses: string[] = await factory.getAllScholarships();

        const details: ScholarshipData[] = await Promise.all(
          addresses.map(async (addr) => {
            const contract = new ethers.Contract(addr, scholarship_ABI, provider);
            const title = await contract.title();
            const company = await contract.company();
            // const minGPA = Number(await contract.gpa());
            const eligibility = await contract.eligibility();
            const minGPA = Number(eligibility[0]) / 100;
            const totalAmount = ethers.formatEther(await contract.totalAmount());
            const deadline = new Date(
              Number(await contract.deadline()) * 1000
            ).toLocaleDateString();
            const statusNum = Number(await contract.status());
            const status = statusMapping[statusNum];

            return { address: addr, title, company, totalAmount, deadline, status, minGPA };
          })
        );

        setScholarships(details);
      } catch (error) {
        console.error("Error fetching scholarships:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScholarships();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {Array(6).fill(0).map((_, index) => (
          <ScholarshipCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {scholarships.map((scholarship) => (
        <ScholarshipCard key={scholarship.address} {...scholarship} />
      ))}
    </div>
  );
}