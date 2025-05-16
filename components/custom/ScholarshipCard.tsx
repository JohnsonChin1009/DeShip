"use client";

import { useEffect } from "react";

interface ScholarshipCardProps {
  address: string;
  title: string;
  company: string;
  totalAmount: string; // formatted
  deadline: string;    // formatted date
  status: string;      // "Open" or "Closed"
  minGPA: number;     // minimum GPA required
}

import ApplicationDialog from "@/components/custom/ApplicationDialog";

// Helper function to truncate Ethereum addresses
const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export default function ScholarshipCard({
  address,
  title,
  company,
  totalAmount,
  deadline,
  status,
  minGPA,
}: ScholarshipCardProps) {

  useEffect(() => {
    console.log("Minimum GPA: ", minGPA);
  }, [minGPA]);

  return (
    <div className="border p-4 rounded-lg shadow-md bg-white mb-4">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      
      <div className="mb-2">
        <strong>Address:</strong> 
        <span className="font-mono text-sm" title={address}>
          {truncateAddress(address)}
        </span>
      </div>
      
      <div className="mb-2">
        <strong>Company:</strong> 
        <span className="font-mono text-sm" title={company}>
          {truncateAddress(company)}
        </span>
      </div>
      
      <div className="mb-2">
        <strong>Total Amount:</strong> {totalAmount} ETH
      </div>
      
      <div className="mb-2">
        <strong>Deadline:</strong> {deadline}
      </div>
      
      <div className="mb-2">
        <strong>Status:</strong> 
        <span className={`font-medium ${status === "Open" ? "text-green-600" : "text-orange-600"}`}>
          {status}
        </span>
      </div>
      
      <div className="mb-2">
        <strong>Min GPA:</strong> {minGPA}
      </div>
      
      <div className="flex justify-end mt-4">
        <ApplicationDialog contractAddress={address} minGPA={minGPA}/>
      </div>
    </div>
  );
}