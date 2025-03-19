"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Sidebar } from "@/components/custom/sidebar";
import { Header } from "@/components/ui/header";
import { mockScholarships } from "@/lib/mockData";

export default function ScholarshipDetailsPage() {
  const { id } = useParams();
  const scholarship = mockScholarships.find((s) => s.id === parseInt(id as string));

  // Add state for sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Add toggle function
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  if (!scholarship) {
    return <div className="min-h-screen flex items-center justify-center">Scholarship not found.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        company={{ name: "Blockchain Education Fund", logo: "/images/techcorp-logo.png", industry: "Education" }}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <main className={`${sidebarOpen ? "ml-64" : "ml-0"} min-h-screen bg-background transition-all`}>
        {/* Header */}
        <Header
          title="Scholarship Details"
          showCreateButton={true}
          createButtonLink="/company/create-scholarship"
          createButtonText="Create Scholarship"
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        {/* Action Buttons */}
        <div className="p-6 pb-3 flex justify-between items-center">
          <Button variant="outline" size="sm" asChild>
            <Link href="/company/scholars">{"< Back to Listings"}</Link>
          </Button>
          <div className="space-x-2">
            <Button variant="outline" size="sm">
              <Pencil className="w-4 h-4 mr-1" /> Edit
            </Button>
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
                    Offered by: {scholarship.organization}
                  </CardDescription>
                </div>
                <div className={`text-sm font-medium px-3 py-1 rounded-full ${scholarship.status === "Active" ? "bg-green-100 text-green-800" :
                  scholarship.status === "Draft" ? "bg-yellow-100 text-yellow-800" :
                    scholarship.status === "Closed" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
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
                    <p className="text-lg font-semibold text-gray-800">${scholarship.amount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Deadline</label>
                    <p className="text-lg font-semibold text-gray-800">
                      {new Date(scholarship.deadline).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Applicants</label>
                    <p className="text-lg font-semibold text-gray-800">{scholarship.applicants}</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Selected Scholars</label>
                    <p className="text-lg font-semibold text-gray-800">
                      {scholarship.selectedScholars} / {scholarship.totalSlots}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-700 leading-relaxed">{scholarship.description}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}