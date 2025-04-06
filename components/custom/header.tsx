"use client";

import Link from 'next/link';
import { Bell, ChevronDown, Globe2, Plus, PanelRightClose } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface HeaderProps {
  title: string;
  showCreateButton?: boolean;
  createButtonLink?: string;
  createButtonText?: string;
  sidebarOpen?: boolean;
  toggleSidebar?: () => void;
}

export function Header({ 
  title, 
  showCreateButton = false, 
  createButtonLink = "/company/create-scholarship", 
  createButtonText = "Create Scholarship",
  sidebarOpen = true,
  toggleSidebar
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          {!sidebarOpen && toggleSidebar && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2"
              onClick={toggleSidebar}
            >
              <PanelRightClose className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {showCreateButton && (
            <Button variant="outline" asChild>
              <Link href={createButtonLink}>
                <Plus className="mr-2 h-4 w-4" />
                {createButtonText}
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative">
                <Globe2 className="h-5 w-5" />
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Blockchain</DropdownMenuItem>
              <DropdownMenuItem>Transaction History</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
} 