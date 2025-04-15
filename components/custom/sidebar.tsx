"use client";

import {
  BarChart3,
  BookOpen,
  Compass,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  PanelLeftClose,
  Users,
  Wallet,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import PrivyButton from "@/components/custom/PrivyButton";

interface SidebarProps {
  role: string;
  isOpen: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

export default function Sidebar({
  role,
  isOpen,
  setIsOpen,
  selectedTab,
  setSelectedTab,
}: SidebarProps) {
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
    { key: "wallet", icon: Wallet, label: "Wallet" },
    { key: "analytics", icon: BarChart3, label: "Analytics" },
    { key: "messages", icon: MessageSquare, label: "Messages" },
  ];

  const studentNavTabs = [
    { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { key: "discover", icon: Compass, label: "Discover" },
  ];

  // Use the appropriate tabs based on the role
  const tabs = role === "Company" ? companyNavTabs : studentNavTabs;

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen ${
        isOpen ? "w-64" : "w-0"
      } border-r bg-card transition-all overflow-hidden`}
    >
      <div className="flex h-full flex-col">
        {/* Company Info with Toggle Button */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src="https://avatars.githubusercontent.com/u/107231772?v=4"
                alt="Johnson's Image"
              />
              <AvatarFallback>Johnson Chin</AvatarFallback>
            </Avatar>
            {isOpen && (
              <div>
                <h2 className="font-semibold truncate max-w-20">
                  0x_JohnsonChin
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
          <nav className="space-y-1">
            {tabs.map((item) => {
              const isActive = selectedTab === item.key;
              console.log("isActive", isActive);
              return (
                <Button
                  key={item.key}
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
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
