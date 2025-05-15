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
import { Eye, PlusCircle, Search } from "lucide-react";
import { ethers } from "ethers";
import { scholarshipFactory_CA, scholarshipFactory_ABI, scholarship_ABI } from "@/lib/contractABI";

// Interface for applicant data
interface ApplicantData {
    walletAddress: string;
    username: string;
    fieldOfStudy: string;
    status: string;
    fundsWithdrawn: string;
}

// Interface for scholarship data
interface ScholarshipData {
    address: string;
    title: string;
}

export default function ApplicationListingSection() {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState('');
    const [applicants, setApplicants] = useState<ApplicantData[]>([]);
    const [scholarships, setScholarships] = useState<ScholarshipData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedScholarship, setSelectedScholarship] = useState<string>('');

    // Fetch company scholarships
    useEffect(() => {
        const fetchCompanyScholarships = async () => {
            try {
                setLoading(true);
                
                // Get wallet from localStorage
                const walletAddress = localStorage.getItem('walletAddress');
                if (!walletAddress) {
                    console.error("No wallet address found");
                    setLoading(false);
                    return;
                }
                
                const provider = new ethers.JsonRpcProvider("https://sepolia-rpc.scroll.io/");
                const factoryContract = new ethers.Contract(
                    scholarshipFactory_CA,
                    scholarshipFactory_ABI,
                    provider
                );
                
                // Get all scholarships created by this company
                const scholarshipAddresses = await factoryContract.getCompanyScholarships(walletAddress);
                
                if (scholarshipAddresses.length === 0) {
                    setLoading(false);
                    return;
                }
                
                // Get details for each scholarship
                const scholarshipsData: ScholarshipData[] = await Promise.all(
                    scholarshipAddresses.map(async (address: string) => {
                        const scholarshipContract = new ethers.Contract(
                            address,
                            scholarship_ABI,
                            provider
                        );
                        
                        const title = await scholarshipContract.title();
                        
                        return {
                            address,
                            title
                        };
                    })
                );
                
                setScholarships(scholarshipsData);
                
                // Set the first scholarship as selected by default
                if (scholarshipsData.length > 0) {
                    setSelectedScholarship(scholarshipsData[0].address);
                }
                
                setLoading(false);
            } catch (error) {
                console.error("Error fetching scholarships:", error);
                setLoading(false);
            }
        };
        
        fetchCompanyScholarships();
    }, []);
    
    // Fetch applicants when a scholarship is selected
    useEffect(() => {
        const fetchApplicants = async () => {
            if (!selectedScholarship) return;
            
            try {
                setLoading(true);
                
                const provider = new ethers.JsonRpcProvider("https://sepolia-rpc.scroll.io/");
                const scholarshipContract = new ethers.Contract(
                    selectedScholarship,
                    scholarship_ABI,
                    provider
                );
                
                // Get applicants from the scholarship contract
                const applicantAddresses = await scholarshipContract.getApplicants();
                
                if (applicantAddresses.length === 0) {
                    setApplicants([]);
                    setLoading(false);
                    return;
                }
                
                // Get details for each applicant from the database
                const applicantsData = await Promise.all(
                    applicantAddresses.map(async (address: string) => {
                        // Get student application data from contract
                        const studentApplication = await scholarshipContract.studentApplications(address);
                        const isApproved = studentApplication.isApproved;
                        const fundsWithdrawn = ethers.formatEther(studentApplication.fundsWithdrawn);
                        
                        // Get student profile data from database
                        const response = await fetch('/api/fetchUserData', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                walletAddress: address,
                                role: 'Student'
                            }),
                        });
                        
                        const data = await response.json();
                        
                        if (response.ok && data.status === 200) {
                            return {
                                walletAddress: address,
                                username: data.data.username || 'Unknown',
                                fieldOfStudy: data.data.field_of_study || 'Not specified',
                                status: isApproved ? 'Approved' : 'Pending',
                                fundsWithdrawn: fundsWithdrawn
                            };
                        } else {
                            return {
                                walletAddress: address,
                                username: 'Unknown',
                                fieldOfStudy: 'Not specified',
                                status: isApproved ? 'Approved' : 'Pending',
                                fundsWithdrawn: fundsWithdrawn
                            };
                        }
                    })
                );
                
                setApplicants(applicantsData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching applicants:", error);
                setLoading(false);
            }
        };
        
        fetchApplicants();
    }, [selectedScholarship]);

    const filteredApplicants = applicants.filter((applicant) =>
        applicant.username.toLowerCase().includes(searchQuery.toLowerCase())
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
                        <CardTitle>Scholarship Applicants</CardTitle>
                        <CardDescription>
                            View and manage students who applied for your scholarships.
                        </CardDescription>
                        {scholarships.length > 0 && (
                            <div className="mt-5">
                                <select
                                    value={selectedScholarship}
                                    onChange={(e) => setSelectedScholarship(e.target.value)}
                                    className="border border-gray-300 rounded px-2 py-1 min-w-[200px]"
                                >
                                    {scholarships.map((scholarship) => (
                                        <option key={scholarship.address} value={scholarship.address}>
                                            {scholarship.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    
                    {scholarships.length > 0 && (
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search applicants..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <p>Loading applicants...</p>
                        </div>
                    ) : scholarships.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-40 space-y-4">
                            <p>You haven't created any scholarships yet.</p>
                            <Link href="/company/create-scholarship">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center gap-2">
                                    <PlusCircle size={16} />
                                    Create Now
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-200 min-w-max">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border px-4 py-2 text-left">Username</th>
                                            <th className="border px-4 py-2 text-left">Field of Study</th>
                                            <th className="border px-4 py-2 text-left">Status</th>
                                            <th className="border px-4 py-2 text-left">Funds Withdrawn (ETH)</th>
                                            <th className="border px-2 py-2 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedApplicants.length > 0 ? (
                                            paginatedApplicants.map((applicant, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="border px-4 py-2">{applicant.username}</td>
                                                    <td className="border px-4 py-2">{applicant.fieldOfStudy}</td>
                                                    <td className="border px-4 py-2">
                                                        <span className={`px-2 py-1 rounded 
                                                            ${applicant.status === "Pending" ? "bg-yellow-100 text-yellow-800" : 
                                                            "bg-green-100 text-green-800"}`}>
                                                            {applicant.status}
                                                        </span>
                                                    </td>
                                                    <td className="border px-4 py-2">{applicant.fundsWithdrawn}</td>
                                                    <td className="border px-2 py-2 text-center">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/company/applicant-details/${applicant.walletAddress}?scholarship=${selectedScholarship}`}>
                                                                <Eye className="inline mr-1 w-4 h-4" /> View Details
                                                            </Link>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="border px-4 py-2 text-center text-gray-500">
                                                    No applicants found for this scholarship
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {paginatedApplicants.length > 0 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-4 sm:space-y-0 sm:space-x-4">
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
                                            disabled={currentPage === totalPages || totalPages === 0}
                                        >
                                            {">>"}
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
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
