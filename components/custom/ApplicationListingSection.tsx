"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Eye, Search } from "lucide-react";

// Interface for applicant data
interface ApplicantData {
    id: number;
    name: string;
    email: string;
    status: string;
    appliedDate: string;
}

const mockApplicants: ApplicantData[] = [
    { id: 1, name: "Alice Tan", email: "alice@example.com", status: "Pending", appliedDate: "2025-05-01" },
    { id: 2, name: "John Lim", email: "john@example.com", status: "Pending", appliedDate: "2025-05-02" },
    { id: 3, name: "Sophia Wong", email: "sophia@example.com", status: "Pending", appliedDate: "2025-05-03" },
    { id: 4, name: "Daniel Lee", email: "daniel@example.com", status: "Rejected", appliedDate: "2025-05-04" },
    { id: 5, name: "Chloe Tan", email: "chloe@example.com", status: "Accepted", appliedDate: "2025-05-05" },
    { id: 6, name: "Marcus Goh", email: "marcus@example.com", status: "Accepted", appliedDate: "2025-05-06" },
];

export default function ApplicationListingSection() {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState('');
    const [applicants, setApplicants] = useState<ApplicantData[]>([]);

    useEffect(() => {
        // Simulate fetch delay
        setTimeout(() => {
            setApplicants(mockApplicants);
        }, 500);
    }, []);

    const filteredApplicants = applicants.filter((applicant) =>
        applicant.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalApplicants = filteredApplicants.length;
    const totalPages = Math.ceil(totalApplicants / itemsPerPage);
    const paginatedApplicants = filteredApplicants.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="p-6">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>Applicants</CardTitle>
                        <CardDescription>
                            View and manage all applicants for your scholarship.
                        </CardDescription>
                    </div>
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search applicants by name..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </CardHeader>

                <CardContent>
                    {applicants.length === 0 ? (
                        <div className="flex justify-center items-center h-40">
                            <p>Loading applicants...</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-200 min-w-max">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border px-4 py-2 text-left">Name</th>
                                            <th className="border px-4 py-2 text-left">Email</th>
                                            <th className="border px-4 py-2 text-left">Status</th>
                                            <th className="border px-4 py-2 text-left">Applied Date</th>
                                            <th className="border px-4 py-2 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedApplicants.length > 0 ? (
                                            paginatedApplicants.map((applicant) => (
                                                <tr key={applicant.id} className="hover:bg-gray-50">
                                                    <td className="border px-4 py-2">{applicant.name}</td>
                                                    <td className="border px-4 py-2">{applicant.email}</td>
                                                    <td className="border px-4 py-2">
                                                        <span className={`px-2 py-1 rounded 
                                                            ${applicant.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                                                applicant.status === "Reviewed" ? "bg-blue-100 text-blue-800" :
                                                                    applicant.status === "Interviewed" ? "bg-purple-100 text-purple-800" :
                                                                        applicant.status === "Accepted" ? "bg-green-100 text-green-800" :
                                                                            "bg-red-100 text-red-800"
                                                            }`}>
                                                            {applicant.status}
                                                        </span>
                                                    </td>
                                                    <td className="border px-4 py-2">{applicant.appliedDate}</td>
                                                    <td className="border px-4 py-2 text-center">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/applicant-details/${applicant.id}`}>
                                                                <Eye className="inline mr-1 w-4 h-4" /> View
                                                            </Link>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="border px-4 py-2 text-center text-gray-500">
                                                    No applicants found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-4 sm:space-y-0 sm:space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        {'<<'}
                                    </Button>
                                    {pageNumbers.map((number) => (
                                        <Button
                                            key={number}
                                            variant={currentPage === number ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setCurrentPage(number)}
                                            className={currentPage === number ? 'bg-blue-500 text-white' : ''}
                                        >
                                            {number}
                                        </Button>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                    >
                                        {'>>'}
                                    </Button>
                                </div>

                                <div className="text-center">
                                    <span className="text-gray-600">
                                        Showing {totalApplicants > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalApplicants)} of {totalApplicants} applicants
                                    </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <span>Items per page:</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="border border-gray-300 rounded px-2 py-1"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
