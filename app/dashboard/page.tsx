"use client";

import { useState, useEffect } from "react";
import PrivyButton from "@/components/custom/privy-button";

export default function DashboardPage() {
    const [role, setRole ] = useState<string>("");

    useEffect(() => {
        const userRole = localStorage.getItem("userRole");

        if (!userRole) {
            return; 
        }

        setRole(userRole);
    }, [])

    return (
        <>
            <main className="min-h-screen flex bg-">
                { role === "Student" ? <StudentDashboard/> :
                role === "Company" ? <CompanyDashboard/> :
                <div>
                    Loading {/* Will replace with Loading Skeleton */}
                </div>}
            </main>
        </> 
    )
}

const StudentDashboard = () => {
    return (
        <>
            <main className="bg-[#F0EBE3] min-w-full flex flex-col gap-3">
                Student Dashboard
                <PrivyButton />
            </main>
        </>
    )
}

const CompanyDashboard = () => {
    return (
        <>
            <div>
                Company Dashboard
            </div>
        </>
    )
}