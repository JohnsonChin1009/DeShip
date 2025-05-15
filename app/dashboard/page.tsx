"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import Header from "@/components/custom/header";
import Dashboard from "@/components/custom/Dashboard";
import Profile from "@/components/custom/ProfileSection";
import DiscoverScholarshipsSection from "@/components/custom/DiscoverScholarshipsSection";
import ScholarshipListing from "@/components/custom/ScholarshipListing";
import ApplicationListingSection from "@/components/custom/ApplicationListingSection";
import CompanyProfileSection from "@/components/custom/CompanyProfileSection";
import Sidebar from "@/components/custom/sidebar";
import PrivyButton from "@/components/custom/PrivyButton";

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
        <PrivyButton />
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

      <div className="flex flex-col flex-1">
        <Header 
          role={role} 
          selectedTab={selectedTab} 
          sidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />
        
        {/* Render the appropriate section from Dashboard component */}
        <div className="flex-1 p-6 bg-[#F0EBE3]">
          {selectedTab === "dashboard" && <Dashboard role={role} />}
          {selectedTab === "discover" && <DiscoverScholarshipsSection />}
          {selectedTab === "scholars" && <ScholarshipListing />}
          {selectedTab === "applications" && <ApplicationListingSection />}
          {selectedTab === "profile" && (
            role === "Student" ? <Profile /> : <CompanyProfileSection />
          )}
        </div>
      </div>
    </main>
  );
}

type SectionProps = {
  selectedTab: string;
};

// const StudentSection = ({ selectedTab }: SectionProps) => {
//   const role = localStorage.getItem("userRole");

//   if (!role) {
//     console.error("Role not found in localStorage");
//     return null;
//   }

//   return (
//     <div className="flex flex-col gap-3">
//       {selectedTab === "dashboard" && <Dashboard role={role} />}
//       {selectedTab === "discover" && <DiscoverScholarshipsSection />}
//       {selectedTab === "profile" && <Profile />}
//       {/* Add more sections as needed */}
//     </div>
//   );
// };


// const CompanySection = ({ selectedTab }: SectionProps) => {

    // Company dashboard is rendering from Dashboard Component

// };
