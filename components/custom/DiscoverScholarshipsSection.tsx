"use client";

import ScholarshipCard from "@/components/custom/ScholarshipCard";
import {
  scholarshipFactory_ABI,
  scholarshipFactory_CA,
  scholarship_ABI,
} from "@/lib/contractABI";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

interface ScholarshipData {
  address: string;
  title: string;
  company: string;
  totalAmount: string;
  deadline: string;
  status: string;
}

export default function DiscoverScholarshipSection() {
  const [scholarships, setScholarships] = useState<ScholarshipData[]>([]);

  useEffect(() => {
    const fetchScholarships = async () => {
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
            const status = (await contract.status()) ? "Open" : "Closed";

            return { address: addr, title, company, totalAmount, deadline, status };
          })
        );

        setScholarships(details);
      } catch (error) {
        console.error("Error fetching scholarships:", error);
      }
    };

    fetchScholarships();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {scholarships.map((scholarship) => (
        <ScholarshipCard key={scholarship.address} {...scholarship} />
      ))}
    </div>
  );
}