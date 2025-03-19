"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Sidebar } from "@/components/custom/sidebar";
import { Header } from "@/components/ui/header";
import { Eye, Search } from "lucide-react";
import { mockScholarships } from "@/lib/mockData";

// Mock data for scholarships
const scholarships = mockScholarships;

export default function ScholarshipListingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Mock company data
  const company = {
    name: "Blockchain Education Fund",
    logo: "/images/techcorp-logo.png",
    industry: "Education",
  };

  // Filter scholarships based on search query (case-insensitive)
  const filteredScholarships = scholarships.filter((scholarship) =>
    scholarship.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalScholarships = filteredScholarships.length;
  const totalPages = Math.ceil(totalScholarships / itemsPerPage);
  const paginatedScholarships = filteredScholarships.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Generate page numbers for display
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar company={company} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <main className={`${sidebarOpen ? "ml-64" : "ml-0"} min-h-screen bg-background transition-all`}>
        {/* Header */}
        <Header title="Scholarship Listings"
          showCreateButton={true}
          createButtonLink="/company/create-scholarship"
          createButtonText="Create Scholarship"
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        {/* Scholarship Table */}
        <div className="p-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Title and Description (Left Side) */}
              <div>
                <CardTitle>Scholarships</CardTitle>
                <CardDescription>Manage and review the available scholarship programs.</CardDescription>
              </div>
              {/* Search Field (Right Side) */}
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search scholarships by title..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </CardHeader>
            <CardContent>
              {/* Responsive Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 min-w-max">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 px-4 py-2 text-left">Title</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Amount</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Deadline</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                      <th className="border border-gray-200 px-4 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedScholarships.length > 0 ? (
                      paginatedScholarships.map((scholarship) => (
                        <tr key={scholarship.id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">{scholarship.title}</td>
                          <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">${scholarship.amount}</td>
                          <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">{scholarship.deadline}</td>
                          <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">{scholarship.status}</td>
                          <td className="border border-gray-200 px-4 py-2 text-center">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/company/scholarship-details/${scholarship.id}`}>
                                <Eye className="inline mr-1 w-4 h-4" /> View
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="border border-gray-200 px-4 py-2 text-center text-gray-500">
                          No scholarships found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-4 sm:space-y-0 sm:space-x-4">
                {/* Page Navigation and Items Per Page */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    {"<<"}
                  </Button>
                  {pageNumbers.map((number) => (
                    <Button
                      key={number}
                      variant={currentPage === number ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(number)}
                      className={currentPage === number ? "bg-blue-500 text-white" : ""}
                    >
                      {number}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    {">>"}
                  </Button>
                </div>
                {/* Counter in the Bottom Middle */}
                <div className="text-center">
                  <span className="text-gray-600">
                    {currentPage} of {totalScholarships}
                  </span>
                </div>
                {/* Counter and Items Per Page */}
                <div className="flex items-center space-x-2">
                  <span>Items per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page when items per page changes
                    }}
                    className="border border-gray-300 rounded px-2 py-1"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}