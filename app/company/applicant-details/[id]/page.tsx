"use client";

import { useEffect } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Sidebar from "@/components/custom/sidebar";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

export default function ApplicantDetailsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedTab, setSelectedTab] = useState("dashboard");
    const { user } = useUser();
    const [role, setRole] = useState<string>("");

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        if (storedRole) {
            setRole(storedRole);
        }
    }, []);

    // Mock applicant data
    const applicant = {
        name: "John Doe",
        email: "johndoe@email.com",
        phone: "+1 234 567 8901",
        gpa: 3.8,
        university: "University of Example",
        major: "Computer Science",
        resumeLink: "https://example.com/resume.pdf",
        status: "Under Review",
        appliedDate: new Date("2025-04-10"),
        notes: "Interested in AI/ML research."
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar
                username={user?.username || ""}
                profileImage={user?.avatar_url || ""}
                role={role}
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
            />

            <div className={`flex-1 ${sidebarOpen ? "ml-6" : "ml-0"} transition-all`}>
                <div className="min-h-screen p-6 bg-[#F0EBE3]">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Applicant Details</h1>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-6 pb-3 flex justify-between items-center">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard">{"< Back "}</Link>
                        </Button>
                        <div className="space-x-2">
                            <Button variant="default" size="sm">
                                <Pencil className="w-4 h-4 mr-1" /> Edit
                            </Button>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4 mr-1" /> Remove
                            </Button>
                        </div>
                    </div>

                    <div className="p-6 pt-3">
                        <Card className="shadow-lg border border-gray-200 rounded-lg">
                            <CardHeader className="border-b border-gray-200 pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-gray-800">{applicant.name}</CardTitle>
                                        <CardDescription className="text-gray-600 mt-1">
                                            {applicant.email}
                                        </CardDescription>
                                    </div>
                                    <div
                                        className={`text-sm font-medium px-3 py-1 rounded-full ${applicant.status === "Under Review"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : applicant.status === "Accepted"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        {applicant.status}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Phone</label>
                                            <p className="text-lg font-semibold text-gray-800">{applicant.phone}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">University</label>
                                            <p className="text-lg font-semibold text-gray-800">{applicant.university}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Major</label>
                                            <p className="text-lg font-semibold text-gray-800">{applicant.major}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">GPA</label>
                                            <p className="text-lg font-semibold text-gray-800">{applicant.gpa}</p>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Applied Date</label>
                                            <p className="text-lg font-semibold text-gray-800">
                                                {applicant.appliedDate.toLocaleDateString("en-US", {
                                                    month: "long",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Resume</label>
                                            <p className="text-lg font-semibold text-blue-600 hover:underline">
                                                <a href={applicant.resumeLink} target="_blank" rel="noopener noreferrer">
                                                    View Resume
                                                </a>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Notes</label>
                                            <p className="text-gray-700 leading-relaxed">{applicant.notes}</p>
                                        </div>
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
