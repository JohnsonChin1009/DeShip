"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import Sidebar from "@/components/custom/sidebar";

export default function DashboardPage() {
  const [role, setRole] = useState<string>("");
  const {user, loading} = useUser();
  const [selectedTab, setSelectedTab] = useState<string>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // To set the user's role from localStorage
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");

    if (userRole) {
      setRole(userRole);
    }
  }, []);

  useEffect(() => {
    console.log("Selected Tab:", selectedTab);
  }, [selectedTab]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading user...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>User not authenticated</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex">
      <Sidebar
        username={user?.username || "Anonymous"}
        profileImage={user?.avatar_url || ""}
        role={role}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
      {role === "Student" ? (
        <StudentDashboard />
      ) : role === "Company" ? (
        <CompanyDashboard />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p>Loading dashboard...</p> {/* Placeholder UI */}
        </div>
      )}
    </main>
  );
}

const StudentDashboard = () => {
  return (
    <main className="bg-[#F0EBE3] min-w-full flex flex-col gap-3">
      Student Dashboard
    </main>
  );
};

const CompanyDashboard = () => {
  return (
    <main className="bg-[#F0EBE3] min-w-full flex flex-col gap-3">
      Company Dashboard
    </main>
  );
};