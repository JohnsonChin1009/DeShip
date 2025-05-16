"use client";

import { useEffect } from "react";
import { Calendar, GraduationCap, School, Coins, ExternalLink } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

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

  // Get status color
  const getStatusColor = () => {
    switch(status) {
      case "Open":
        return "bg-green-100 text-green-800 border-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Closed":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg shadow-md bg-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-blue-200">
      <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      
      <div className="p-5">
        {/* Header with title and status */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-800 line-clamp-2">{title}</h2>
          <Badge className={`ml-2 ${getStatusColor()}`}>
            {status}
          </Badge>
        </div>
        
        {/* Amount */}
        <div className="mb-4">
          <div className="flex items-center text-2xl font-bold text-blue-600 mb-1">
            <Coins className="h-5 w-5 mr-2 text-blue-500" />
            {totalAmount} ETH
          </div>
          <p className="text-sm text-gray-500">Total scholarship amount</p>
        </div>
        
        {/* Info grid */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          <div className="flex items-center text-gray-700">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <div>
              <span className="text-sm font-medium">Deadline:</span> {deadline}
            </div>
          </div>
          
          <div className="flex items-center text-gray-700">
            <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
            <div>
              <span className="text-sm font-medium">Min GPA:</span> {minGPA}
            </div>
          </div>
          
          <div className="flex items-center text-gray-700">
            <School className="h-4 w-4 mr-2 text-gray-500" />
            <div>
              <span className="text-sm font-medium">Company:</span>
              <span className="font-mono text-sm ml-1" title={company}>
                {truncateAddress(company)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center text-gray-700">
            <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
            <div>
              <span className="text-sm font-medium">Address:</span>
              <span className="font-mono text-sm ml-1" title={address}>
                {truncateAddress(address)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Apply button */}
        <div className="flex justify-end mt-4">
          <ApplicationDialog contractAddress={address} minGPA={minGPA}/>
        </div>
      </div>
    </div>
  );
}