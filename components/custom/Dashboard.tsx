"use client";

interface DashboardSectionProps {
    role: string;
}

export default function DashboardSection({ role }: DashboardSectionProps) {
    const dashboard = role === "Company" ? CompanyDashboard() : StudentDashboard();

    return (
        <div>
            {dashboard}
        </div>
    )
}

const CompanyDashboard = () => {
    return (
        <>
            <div>
                Company Dashboard
                {/* Add the company dashboard here */}
            </div>
        </>
    )
}

const StudentDashboard = () => {
    return (
        <>
                    <div>
                Student Dashboard
            </div>
        </>
    )
}