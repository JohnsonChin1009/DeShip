"use client";

interface ScholarshipCardProps {
  address: string;
  title: string;
  company: string;
  totalAmount: string; // formatted
  deadline: string;    // formatted date
  status: string;      // "Open" or "Closed"
}

import ApplicationDialog from "@/components/custom/ApplicationDialog";

export default function ScholarshipCard({
  address,
  title,
  company,
  totalAmount,
  deadline,
  status,
}: ScholarshipCardProps) {
  return (
    <div className="border p-4 rounded-lg shadow-md bg-white mb-4">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
    <p><strong>Address:</strong> {address}</p>
      <p><strong>Company:</strong> {company}</p>
      <p><strong>Total Amount:</strong> {totalAmount} ETH</p>
      <p><strong>Deadline:</strong> {deadline}</p>
      <p><strong>Status:</strong> {status}</p>
      <div className="flex justify-end mt-4">
        <ApplicationDialog />
      </div>
    </div>
  );
}
