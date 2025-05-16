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
import { Card, CardContent } from "@/components/ui/card";

const statusMapping = ["Open", "In Progress", "Closed", "Completed"];

interface ScholarshipData {
  address: string;
  title: string;
  company: string;
  totalAmount: string;
  deadline: string;
  status: string;
}

const ScholarshipCardSkeleton = () => {
  return (
    <Card className="border p-4 rounded-lg shadow-md bg-white mb-4">
      <CardContent className="p-0 pt-4">
        <Skeleton className="h-7 w-3/4 mb-4" />
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-5 w-2/3 mb-2" />
        <Skeleton className="h-5 w-1/2 mb-2" />
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-5 w-1/3 mb-2" />
        <div className="flex justify-end mt-4">
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
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
            const totalAmount = ethers.formatEther(await contract.totalAmount());
            const deadline = new Date(
              Number(await contract.deadline()) * 1000
            ).toLocaleDateString();
            const statusNum = Number(await contract.status());
            const status = statusMapping[statusNum];

            return { address: addr, title, company, totalAmount, deadline, status };
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