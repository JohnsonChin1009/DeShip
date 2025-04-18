"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import Header from "@/components/custom/Header";
import Sidebar from "@/components/custom/Sidebar";

export default function DashboardPage() {
  const [role, setRole] = useState<string>("");
  const { user, loading } = useUser();
  const [selectedTab, setSelectedTab] = useState<string>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
        username={user?.username || "Steve"}
        profileImage={user?.avatar_url || ""}
        role={role}
        isOpen={isSidebarOpen}
        setIsOpen={toggleSidebar}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
      
      {/* Main content area that adapts to sidebar */}
      <div className="flex flex-col flex-1">
        <Header role={role} selectedTab={selectedTab} sidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 p-6 bg-[#F0EBE3]">
          {role === "Student" ? (
            <StudentDashboard />
          ) : role === "Company" ? (
            <CompanyDashboard />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p>Loading dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const StudentDashboard = () => {
  return (
    <div className="flex flex-col gap-3">
      Student Dashboard
    </div>
  );
};

const CompanyDashboard = () => {
  return (
    <div className="flex flex-col gap-3">
      Company Dashboard
    </div>
  );
};
