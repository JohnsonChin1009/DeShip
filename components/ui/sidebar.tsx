"use client";

import Link from 'next/link';
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PanelLeftClose,
  Settings,
  Users,
  Wallet
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  company: {
    name: string;
    logo?: string;
    industry?: string;
  };
  isOpen: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export function Sidebar({ company, isOpen, setIsOpen }: SidebarProps) {
  const toggleSidebar = () => {
    if (setIsOpen) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <aside className={`fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-full flex-col">
        {/* Company Info with Toggle Button */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={company.logo} alt={company.name} />
              <AvatarFallback>{company.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{company.name}</h2>
              {company.industry && (
                <p className="text-sm text-muted-foreground">{company.industry}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/company/dashboard">
                <LayoutDashboard className="mr-3 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/company/scholars">
                <GraduationCap className="mr-3 h-4 w-4" />
                Scholars
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/company/programs">
                <BookOpen className="mr-3 h-4 w-4" />
                Programs
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/company/applications">
                <Users className="mr-3 h-4 w-4" />
                Applications
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/company/wallet">
                <Wallet className="mr-3 h-4 w-4" />
                Wallet
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/company/analytics">
                <BarChart3 className="mr-3 h-4 w-4" />
                Analytics
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/company/messages">
                <MessageSquare className="mr-3 h-4 w-4" />
                Messages
              </Link>
            </Button>
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/company/settings">
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-destructive">
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
} 