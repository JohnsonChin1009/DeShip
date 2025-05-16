"use client";

interface ScholarshipCardProps {
  address: string;
  title: string;
  company: string;
  totalAmount: string; // formatted
  deadline: string;    // formatted date
  status: string;      // Status string from the mapping
}

import ApplicationDialog from "@/components/custom/ApplicationDialog";
import { Button } from "@/components/ui/button";

export default function ScholarshipCard({
  address,
  title,
  company,
  totalAmount,
  deadline,
  status,
}: ScholarshipCardProps) {
  const isOpen = status === "Open";
  
  return (
    <div className="border p-4 rounded-lg shadow-md bg-white mb-4">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p><strong>Address:</strong> {address}</p>
      <p><strong>Company:</strong> {company}</p>
      <p><strong>Total Amount:</strong> {totalAmount} ETH</p>
      <p><strong>Deadline:</strong> {deadline}</p>
      <p><strong>Status:</strong> <span className={`px-2 py-1 rounded ${
        status === "Open" ? "bg-green-100 text-green-800" :
        status === "In Progress" ? "bg-blue-100 text-blue-800" :
        status === "Closed" ? "bg-yellow-100 text-yellow-800" :
        "bg-gray-100 text-gray-800"
      }`}>{status}</span></p>
      <div className="flex justify-end mt-4">
        {isOpen ? (
          <ApplicationDialog />
        ) : (
          <Button disabled className="opacity-50 cursor-not-allowed">
            Applications Closed
          </Button>
        )}
      </div>
    </div>
  );
}
