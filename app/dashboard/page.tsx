"use client";

import Sidebar from "@/components/custom/sidebar"
import PrivyButton from "@/components/custom/privy-button";
export default function DashboardPage() {
    return (
        <>
            <main className="min-h-screen flex">
                <div className="max-w-[30%]">
                    <Sidebar />
                </div>
                <div>
                    <PrivyButton />
                </div>
            </main>
        </> 
    )
}