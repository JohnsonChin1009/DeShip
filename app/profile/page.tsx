"use client";

import { Header } from "@/components/custom/header";
import StudentSidebar from "@/components/custom/student-sidebar";

export default function ProfilePage() {
    return (
        <>
            <main className="min-h-screen flex">
                <StudentSidebar/>
                {/* Main Content */}
                <section>
                    <Header 
                        title = "Profile"
                    />
                </section>
            </main>
        </>
    )
}