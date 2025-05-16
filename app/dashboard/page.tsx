"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import Header from "@/components/custom/header";
import Dashboard from "@/components/custom/Dashboard";
import Profile from "@/components/custom/ProfileSection";
import DiscoverScholarshipsSection from "@/components/custom/DiscoverScholarshipsSection";
import ScholarshipListing from "@/components/custom/ScholarshipListing";
import ApplicationListingSection from "@/components/custom/ApplicationListingSection";
import Sidebar from "@/components/custom/sidebar";
import PrivyButton from "@/components/custom/PrivyButton";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { usePrivy } from "@privy-io/react-auth";

// Create a skeleton for the entire dashboard layout
const FullPageSkeleton = () => {
  return (
    <main className="min-h-screen flex">
      {/* Sidebar Skeleton */}
      <div className="hidden md:flex h-screen w-64 flex-col bg-card border-r p-4">
        <div className="flex items-center gap-3 mb-8 mt-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        
        <div className="space-y-5 mt-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
        
        <div className="mt-auto mb-4">
          <Skeleton className="h-8 w-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header Skeleton */}
        <div className="h-16 border-b px-6 flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        
        {/* Dashboard Content Skeleton */}
        <div className="flex-1 p-6 bg-[#F0EBE3]">
          <div className="space-y-6">
            {/* Cards Row */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      <Skeleton className="h-4 w-24" />
                    </CardTitle>
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>
                      <Skeleton className="h-5 w-36" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center">
                      <Skeleton className={`h-[180px] ${i === 1 ? 'w-[180px] rounded-full' : 'w-full'}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default function DashboardPage() {
  const [role, setRole] = useState<string>("");
  const { user, loading } = useUser();
  const [selectedTab, setSelectedTab] = useState<string>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const { ready, authenticated } = usePrivy();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole) {
      setRole(userRole);
    }
  }, []);

  if (loading || !ready || !authenticated) {
    return <FullPageSkeleton />;
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
          {selectedTab === "profile" && <Profile role={role} />}
          
        </div>
      </div>
    </main>
  );
}

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
