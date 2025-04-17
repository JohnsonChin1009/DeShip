"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/custom/sidebar";

export default function DashboardPage() {
    const [role, setRole ] = useState<string>("");
    const [selectedTab, setSelectedTab] = useState<string>("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true); // NEW


    async function fetchUserData() {
        const userData = await fetch("/api/getUserData", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                walletAddress: localStorage.getItem("walletAddress"),
                role: localStorage.getItem("userRole")
            })
        })

        if (!userData.ok) {
            console.error("Error fetching user data");
            return;
        }

        const userdata = await userData.json();
        console.log("User Data:", userdata);
    }

    // To set the user's role from localStorage
    useEffect(() => {
        const userRole = localStorage.getItem("userRole");

        if (!userRole) {
            return; 
        }

        setRole(userRole);

        fetchUserData();
    }, [])

    useEffect(() => {
        console.log("Selected Tab:", selectedTab);
    }, [selectedTab]);

    return (
        <main className="min-h-screen flex bg-">
            <Sidebar role={role} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
            { role === "Student" ? <StudentDashboard/> :
            role === "Company" ? <CompanyDashboard/> :
            <div>
                Loading {/* Will replace with Loading Skeleton */}
            </div>}
        </main>
    )
}

const StudentDashboard = () => {
    return (
        <>
            <main className="bg-[#F0EBE3] min-w-full flex flex-col gap-3">
                Student Dashboard
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