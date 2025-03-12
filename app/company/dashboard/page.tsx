"use client";

import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Bell,
  BookOpen,
  ChevronDown,
  Globe2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plus,
  Settings,
  Users,
  Wallet
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { mockCompanies, mockScholars, mockScholarships, mockTransactions } from '@/lib/mockData';

const company = mockCompanies[0];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function CompanyDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          {/* Company Info */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={company.logo} alt={company.name} />
                <AvatarFallback>{company.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{company.name}</h2>
                <p className="text-sm text-muted-foreground">{company.industry}</p>
              </div>
            </div>
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

      {/* Main Content */}
      <main className={`${sidebarOpen ? 'ml-64' : 'ml-0'} min-h-screen bg-background transition-all`}>
        {/* Header */}
        <header className="sticky top-0 z-30 border-b bg-background">
          <div className="flex h-16 items-center justify-between px-6">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/company/create-scholarship">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Scholarship
                </Link>
              </Button>
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

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Scholars</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{company.metrics?.totalScholars}</div>
                <p className="text-xs text-muted-foreground">
                  {company.metrics?.activeScholars} currently active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Funding</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${company.metrics?.totalFundsAllocated.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across {company.scholarshipsPosted} programs
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{company.metrics?.successRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Program completion rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ROI</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{company.metrics?.roi}%</div>
                <p className="text-xs text-muted-foreground">
                  Return on investment
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Funding Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={company.metrics?.geographicDistribution}
                        dataKey="funding"
                        nameKey="region"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {company.metrics?.geographicDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scholar Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={company.metrics?.scholarPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="performance" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTransactions.map((tx) => (
                    <div key={tx.hash} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{tx.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(tx.timestamp), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${tx.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{tx.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Scholars</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockScholars.map((scholar) => (
                    <div key={scholar.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{scholar.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{scholar.name}</p>
                            <p className="text-sm text-muted-foreground">{scholar.program}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                      <Progress value={scholar.performance} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Performance</span>
                        <span>{scholar.performance}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}