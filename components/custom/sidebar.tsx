"use client";

import { BookOpen, Compass, GraduationCap, LayoutDashboard, PanelLeftClose, Users, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import PrivyButton from "@/components/custom/PrivyButton";

interface SidebarProps {
  username: string;
  profileImage: string;
  role: string;
  isOpen: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

export default function Sidebar({ role, isOpen, setIsOpen, selectedTab, setSelectedTab, username, profileImage }: SidebarProps) {
  const toggleSidebar = () => {
    if (setIsOpen) {
      setIsOpen(!isOpen);
    }
  };

  const companyNavTabs = [
    { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { key: "scholars", icon: GraduationCap, label: "Scholars" },
    { key: "programs", icon: BookOpen, label: "Programs" },
    { key: "applications", icon: Users, label: "Applications" },
    { key: "profile", icon: User, label: "Profile" },
  ];

  const studentNavTabs = [
    { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { key: "discover", icon: Compass, label: "Discover" },
    { key: "profile", icon: User, label: "Profile" },
  ];

  // Use the appropriate tabs based on the role
  const tabs = role === "Company" ? companyNavTabs : studentNavTabs;

  return (
    <aside
      className={`h-screen transition-all border-r bg-card overflow-hidden ${isOpen ? "w-64" : "w-0"
        }`}
    >
      <div className="flex h-full flex-col">
        {/* Company Image, Info with Toggle Button */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={profileImage}
                alt={`${username}'s profile image`}
              />
              <AvatarFallback>{username}</AvatarFallback>
            </Avatar>
            {isOpen && (
              <div>
                <h2 className="font-semibold text-sm truncate max-w-28">
                  {username}
                </h2>
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Tabs */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {tabs.map((item) => {
              const isActive = selectedTab === item.key;
              console.log("isActive", isActive);
              return (
                <Button
                  key={item.key}
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start text-md"
                  onClick={() => setSelectedTab(item.key)}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {isOpen && item.label}
                </Button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="border-t p-4 relative space-y-2">
          <PrivyButton />
          <p className="text-xs text-center text-gray-500">deShip © 2025</p>
        </div>
      </div>
    </aside>
  );
}
