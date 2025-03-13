"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const toggleSidebar = () => {
    if (setIsOpen) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <aside className={`fixed left-0 top-0 z-40 h-screen ${isOpen ? 'w-64' : 'w-0'} border-r bg-card transition-all overflow-hidden`}>
      <div className="flex h-full flex-col">
        {/* Company Info with Toggle Button */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={company.logo} alt={company.name} />
              <AvatarFallback>{company.name[0]}</AvatarFallback>
            </Avatar>
            {isOpen && (
              <div>
                <h2 className="font-semibold">{company.name}</h2>
                {company.industry && (
                  <p className="text-sm text-muted-foreground">{company.industry}</p>
                )}
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {[
              { href: '/company/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { href: '/company/scholars', icon: GraduationCap, label: 'Scholars' },
              { href: '/company/programs', icon: BookOpen, label: 'Programs' },
              { href: '/company/applications', icon: Users, label: 'Applications' },
              { href: '/company/wallet', icon: Wallet, label: 'Wallet' },
              { href: '/company/analytics', icon: BarChart3, label: 'Analytics' },
              { href: '/company/messages', icon: MessageSquare, label: 'Messages' },
            ].map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? 'default' : 'ghost'}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-3 h-4 w-4" />
                  {isOpen && item.label}
                </Link>
              </Button>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4">
          <Button variant={pathname === '/company/settings' ? 'default' : 'ghost'} className="w-full justify-start" asChild>
            <Link href="/company/settings">
              <Settings className="mr-3 h-4 w-4" />
              {isOpen && 'Settings'}
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-destructive">
            <LogOut className="mr-3 h-4 w-4" />
            {isOpen && 'Logout'}
          </Button>
        </div>
      </div>
    </aside>
  );
}
