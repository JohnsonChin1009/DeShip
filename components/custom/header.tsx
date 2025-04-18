"use client";

import { useState, useEffect } from "react";
import { Bell, ChevronDown, Globe2, Plus, PanelRightClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface HeaderProps {
  selectedTab: string;
  role: string;
  sidebarOpen?: boolean;
  toggleSidebar?: () => void;
}

export default function Header({selectedTab, sidebarOpen = true, toggleSidebar, role}: HeaderProps) {
  const [currentTab, setCurrentTab] = useState(selectedTab);

  useEffect(() => {
    setCurrentTab(selectedTab.toUpperCase());
  }, [selectedTab]);

  const rightArea = role === "Company" ? CompanyHeader() : StudentHeader();


  return (
    <>
      <header className="sticky border-b bg-background w-full">
        <div className="flex items-center justify-between p-6 min-h-20">
          {/* Sidebar Toggle + Section Title */}
          <div className="flex items-center gap-3">
            {!sidebarOpen && toggleSidebar && (
              <Button variant="ghost" size="icon" className="mr-2" onClick={toggleSidebar}>
                <PanelRightClose />
              </Button>
            )}
            <h1 className="text-xl font-bold">{currentTab}</h1>
          </div>

          {/* Right Side of Header */}
          <div className="flex items-center space-x-8">
            {rightArea}
          </div>
        </div>
      </header>
    </>
  )
}

function CompanyHeader() {
  return (
    <>
      <Button variant="outline" className="gap-2">
        <Plus className="h-4 w-4"/>
        Create
      </Button>

      <div>
        <Button variant="ghost" size="icon">
          <Bell className="h-8 w-8"/>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative gap-2">
              <Globe2 className="h-5 w-5"/>
              <ChevronDown className="h-4 w-4"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Blockchain</DropdownMenuItem>
            <DropdownMenuItem>Transaction History</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}

function StudentHeader() {
  return (
    <>
    <div>
      Student Header
    </div>
    </>
  )
}