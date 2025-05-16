"use client";

import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Building2, Link, Wallet, BookOpen, GraduationCap } from "lucide-react";
import { CompanyProfileEditDialog } from "@/components/custom/CompanyProfileEditDialog";
import { StudentProfileEditDialog } from "@/components/custom/StudentProfileEditDialog";
import { useState } from "react";

interface ProfileSectionProps {
  role: string;
}

export default function ProfileSection( { role }: ProfileSectionProps) {
  const profile = role === "Company" ? <CompanyProfile /> : <StudentProfile />;
  return (
    <>
      {/* Section Wrapper */}
      <div className="p-4">
        {profile}
      </div>
    </>
  )
}

const CompanyProfile = () => {
  const [ editOpen, setEditOpen ] = useState(false);
  const { user, refetchUserData } = useUser();

  if (!user) return <div className="p-6">Loading company profile...</div>;

  // Cast user to any temporarily to access company-specific fields safely
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userAny = user as any;
  return (
    <>
      <div className="p-6">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>
                    View your registered company details.
                </CardDescription>
            </div>
            {/* 🧾 Modal Dialog */}
            <CompanyProfileEditDialog
                open={editOpen}
                setOpen={setEditOpen}
                companyData={{
                    name: user.username ?? "",
                    description: user.description ?? "",
                    website: userAny.website_url ?? "",
                    industry: userAny.industry ?? "",
                    walletAddress: user.wallet_address ?? "",
                    avatarURL: user.avatar_url ?? "",
                }}
                onUpdate={async (updatedData) => {
                    console.log("Updated company data:", updatedData);
                    // TODO: Trigger data re-fetch or context update here if needed
                    await refetchUserData();
                    return true;
                }}
            />
          </CardHeader>
    
          <CardContent>
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                      {/* Company Avatar */}
                      <Image
                          src={user?.avatar_url || "https://avatars.githubusercontent.com/u/107231772?v=4"}
                          alt="Company Logo"
                          width={180}
                          height={180}
                          className="rounded-full border border-gray-300 shadow-sm"
                      />
                      {/* Company Info */}
                      <div className="w-full flex flex-col space-y-4">
                          <div className="text-lg font-semibold text-gray-900">
                              {user.username || "Company Name"}
                          </div>
                          <p className="text-gray-700 text-sm">
                              {user.description || "No description provided."}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Building2 className="w-4 h-4 text-gray-500" />
                              <span>
                                  <strong>Industry:</strong>{" "}
                                  {Array.isArray(userAny.industry)
                                      ? userAny.industry.join(", ")
                                      : userAny.industry || "N/A"}
                              </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 break-words">
                              <Wallet className="w-4 h-4 text-gray-500" />
                              <span>
                                  <strong>Wallet:</strong> {user.wallet_address || "N/A"}
                              </span>
                          </div>
                          {userAny.website_url && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Link className="w-4 h-4 text-gray-500" />
                                  <a
                                      href={userAny.website_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline break-all"
                                  >
                                      {userAny.website_url}
                                  </a>
                              </div>
                          )}
                      </div>
                  </div>
              </CardContent>
                </Card>
            </div>
    </>
  )
}

const StudentProfile = () => {
  const [ editOpen, setEditOpen ] = useState(false);
  const { user, refetchUserData } = useUser();

  if (!user) return <div className="p-6">Loading student profile...</div>;

  // Cast user to any temporarily to access student-specific fields safely
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userAny = user as any;
  
  return (
    <>
      <div className="p-6">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <CardTitle>Student Profile</CardTitle>
                <CardDescription>
                    View your registered student details.
                </CardDescription>
            </div>
            {/* Edit Dialog */}
            <StudentProfileEditDialog
                open={editOpen}
                setOpen={setEditOpen}
                studentData={{
                    name: user.username ?? "",
                    description: user.description ?? "",
                    academic_progression: userAny.academic_progression ?? "",
                    field_of_study: userAny.field_of_study ?? "",
                    portfolio_url: userAny.portfolio_url ?? "",
                    walletAddress: user.wallet_address ?? "",
                    avatarURL: user.avatar_url ?? "",
                }}
                onUpdate={async (updatedData) => {
                    console.log("Updated student data:", updatedData);
                    await refetchUserData();
                    return true;
                }}
            />
          </CardHeader>
    
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Student Avatar */}
              <Image
                src={user?.avatar_url || "https://avatars.githubusercontent.com/u/107231772?v=4"}
                alt="Student Profile"
                width={180}
                height={180}
                className="rounded-full border border-gray-300 shadow-sm"
              />
              
              {/* Student Info */}
              <div className="w-full flex flex-col space-y-4">
                <div className="text-lg font-semibold text-gray-900">
                  {user.username || "Student Name"}
                </div>
                
                <p className="text-gray-700 text-sm">
                  {user.description || "No description provided."}
                </p>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <GraduationCap className="w-4 h-4 text-gray-500" />
                  <span>
                    <strong>Academic Level:</strong>{" "}
                    {userAny.academic_progression || "N/A"}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  <span>
                    <strong>Field of Study:</strong>{" "}
                    {userAny.field_of_study || "N/A"}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 break-words">
                  <Wallet className="w-4 h-4 text-gray-500" />
                  <span>
                    <strong>Wallet:</strong> {user.wallet_address || "N/A"}
                  </span>
                </div>
                
                {userAny.portfolio_url && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Link className="w-4 h-4 text-gray-500" />
                    <a
                      href={userAny.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {userAny.portfolio_url}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}