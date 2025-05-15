/* eslint-disable @typescript-eslint/no-explicit-any */
//will add interface later
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Sidebar from '@/components/custom/sidebar';
import { useUser } from "@/context/UserContext";
import { ethers } from "ethers";
import { scholarship_ABI } from "@/lib/contractABI";
import { ScholarshipEditDialog } from "@/components/custom/ScholarshipEditDialog";
import React from "react";

const statusMapping = ["Open", "In Progress", "Closed", "Completed"];

export default function ScholarshipDetailsPage() {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [scholarship, setScholarship] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<string>('dashboard');
  const [milestones, setMilestones] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<string[]>([]);
  const [approvedStudents, setApprovedStudents] = useState<string[]>([]);
  const { user } = useUser();

  const fetchScholarshipDetails = React.useCallback(async () => {
    setLoading(true);
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);

        // Connect to the Scholarship contract using the address from params
        const scholarshipContract = new ethers.Contract(
          id as string,
          scholarship_ABI,
          provider
        );

        const title = await scholarshipContract.title();
        const description = await scholarshipContract.description();
        const totalAmount = await scholarshipContract.totalAmount();
        const deadline = await scholarshipContract.deadline();
        const status = await scholarshipContract.status();
        const company = await scholarshipContract.company();
        const eligibility = await scholarshipContract.eligibility();
        const balance = await scholarshipContract.getContractBalance();

        const totalMilestones = await scholarshipContract.getTotalMilestones();
        const milestonesPromises = [];

        for (let i = 0; i < Number(totalMilestones); i++) {
          milestonesPromises.push(scholarshipContract.getMilestone(i));
        }

        const milestonesData = await Promise.all(milestonesPromises);
        const formattedMilestones = milestonesData.map((milestone, index) => ({
          id: index,
          title: milestone.titleReturn,
          amount: ethers.formatEther(milestone.amount),
          isCompleted: milestone.isCompleted
        }));

        setMilestones(formattedMilestones);

        try {
          const applicantsCount = await scholarshipContract.applicants.length;
          const approvedStudentsCount = await scholarshipContract.approvedStudents.length;

          setApplicants(new Array(Number(applicantsCount)).fill(''));
          setApprovedStudents(new Array(Number(approvedStudentsCount)).fill(''));
        } catch (error) {
          console.log("Could not fetch applicants/approved students arrays:", error);
        }

        //mapping
        const scholarshipData = {
          address: id,
          title: title,
          description: description,
          amount: ethers.formatEther(totalAmount),
          deadline: new Date(Number(deadline) * 1000),
          status: statusMapping[Number(status)],
          company: company,
          gpa: Number(eligibility.gpa) / 100, // GPA is likely stored with 2 decimal places
          additionalRequirements: eligibility.additionalRequirements,
          remainingBalance: ethers.formatEther(balance),
          applicantsCount: applicants.length,
          selectedScholarsCount: approvedStudents.length
        };

        setScholarship(scholarshipData);
      }
    } catch (error) {
      console.error("Error fetching scholarship details:", error);
      setError("Could not load scholarship details. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [id, applicants.length, approvedStudents.length]);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole) {
      setRole(userRole);
    }

    if (id) {
      fetchScholarshipDetails();
    }
  }, [id, fetchScholarshipDetails]);

  // To update scholarship data without causing a page reload
  const updateScholarshipData = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);

        const scholarshipContract = new ethers.Contract(
          id as string,
          scholarship_ABI,
          provider
        );

        const title = await scholarshipContract.title();
        const description = await scholarshipContract.description();
        const totalAmount = await scholarshipContract.totalAmount();
        const deadline = await scholarshipContract.deadline();
        const status = await scholarshipContract.status();
        const company = await scholarshipContract.company();
        const eligibility = await scholarshipContract.eligibility();
        const balance = await scholarshipContract.getContractBalance();

        const totalMilestones = await scholarshipContract.getTotalMilestones();
        const milestonesPromises = [];

        for (let i = 0; i < Number(totalMilestones); i++) {
          milestonesPromises.push(scholarshipContract.getMilestone(i));
        }

        const milestonesData = await Promise.all(milestonesPromises);
        const formattedMilestones = milestonesData.map((milestone, index) => ({
          id: index,
          title: milestone.titleReturn,
          amount: ethers.formatEther(milestone.amount),
          isCompleted: milestone.isCompleted
        }));

        setMilestones(formattedMilestones);

        // Update the scholarship data state
        setScholarship((prev: any) => ({
          ...prev,
          title: title,
          description: description,
          amount: ethers.formatEther(totalAmount),
          deadline: new Date(Number(deadline) * 1000),
          status: statusMapping[Number(status)],
          company: company,
          gpa: Number(eligibility.gpa) / 100,
          additionalRequirements: eligibility.additionalRequirements,
          remainingBalance: ethers.formatEther(balance)
        }));

        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating scholarship data:", error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading scholarship details...
      </div>
    );
  }

  if (error || !scholarship) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {error || "Scholarship not found."}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        username={user?.username || ""}
        profileImage={user?.avatar_url || ""}
        role={role}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-6' : 'ml-0'} transition-all`}>
        <div className="p-6 bg-[#F0EBE3]">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Scholarship Details</h1>
          </div>

          {/* Action Buttons */}
          <div className="p-6 pb-3 flex justify-between items-center">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">{"< Back "}</Link>
            </Button>
            <div className="space-x-2">
              <ScholarshipEditDialog
                scholarshipAddress={id as string}
                scholarshipData={{
                  title: scholarship.title,
                  description: scholarship.description,
                  gpa: scholarship.gpa,
                  additionalRequirements: scholarship.additionalRequirements,
                  deadline: scholarship.deadline
                }}
                contractABI={scholarship_ABI}
                onUpdate={updateScholarshipData}
              />
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </div>

          {/* Scholarship Details */}
          <div className="p-6 pt-3">
            <Card className="shadow-lg border border-gray-200 rounded-lg">
              <CardHeader className="border-b border-gray-200 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800">{scholarship.title}</CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      Contract Address: {scholarship.address.slice(0, 8)}...{scholarship.address.slice(-6)}
                    </CardDescription>
                  </div>
                  <div className={`text-sm font-medium px-3 py-1 rounded-full ${scholarship.status === "Open" ? "bg-green-100 text-green-800" :
                    scholarship.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                      scholarship.status === "Closed" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                    }`}>
                    {scholarship.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Amount</label>
                      <p className="text-lg font-semibold text-gray-800">{scholarship.amount} ETH</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Remaining Balance</label>
                      <p className="text-lg font-semibold text-gray-800">{scholarship.remainingBalance} ETH</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Deadline</label>
                      <p className="text-lg font-semibold text-gray-800">
                        {scholarship.deadline.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Eligibility</label>
                      <p className="text-gray-800">
                        <span className="font-medium">Minimum GPA:</span> {scholarship.gpa}
                      </p>
                      {scholarship.additionalRequirements && (
                        <p className="text-gray-800 mt-1">
                          <span className="font-medium">Additional Requirements:</span> {scholarship.additionalRequirements}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Applicants</label>
                      <p className="text-lg font-semibold text-gray-800">{scholarship.applicantsCount}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Selected Scholars</label>
                      <p className="text-lg font-semibold text-gray-800">
                        {scholarship.selectedScholarsCount}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-gray-700 leading-relaxed">{scholarship.description}</p>
                    </div>
                  </div>
                </div>

                {/* Milestones Section */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Milestones</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-200 px-4 py-2 text-left">Title</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Amount (ETH)</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {milestones.map((milestone) => (
                          <tr key={milestone.id} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-4 py-2">{milestone.title}</td>
                            <td className="border border-gray-200 px-4 py-2">{milestone.amount}</td>
                            <td className="border border-gray-200 px-4 py-2">
                              <span className={`px-2 py-1 rounded ${milestone.isCompleted ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                }`}>
                                {milestone.isCompleted ? "Completed" : "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {milestones.length === 0 && (
                          <tr>
                            <td colSpan={3} className="border border-gray-200 px-4 py-2 text-center text-gray-500">
                              No milestones found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}