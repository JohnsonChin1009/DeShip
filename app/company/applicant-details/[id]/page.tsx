"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Sidebar from "@/components/custom/sidebar";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { ethers } from "ethers";
import { scholarship_ABI } from "@/lib/contractABI";

interface StudentProfile {
  username: string;
  description: string;
  avatar_url: string;
  field_of_study: string;
  academic_progression: string;
  portfolio_url: string;
  wallet_address: string;
}

export default function ApplicantDetailsPage({ params }: { params: { id: string } }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const { user } = useUser();
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [fundsWithdrawn, setFundsWithdrawn] = useState<string>("0");
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [scholarshipTitle, setScholarshipTitle] = useState<string>("");
  const [avatarImages, setAvatarImages] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const scholarshipAddress = searchParams.get("scholarship");
  const studentAddress = params.id;

  // Fetch avatar images
  useEffect(() => {
    setAvatarImages([
      "https://mvmkybzjlmfhuaqrtlii.supabase.co/storage/v1/object/public/profile-images//1.png",
      "https://mvmkybzjlmfhuaqrtlii.supabase.co/storage/v1/object/public/profile-images//2.png",
      "https://mvmkybzjlmfhuaqrtlii.supabase.co/storage/v1/object/public/profile-images//3.png",
      "https://mvmkybzjlmfhuaqrtlii.supabase.co/storage/v1/object/public/profile-images//4.png",
      "https://mvmkybzjlmfhuaqrtlii.supabase.co/storage/v1/object/public/profile-images//5.png",
      "https://mvmkybzjlmfhuaqrtlii.supabase.co/storage/v1/object/public/profile-images//6.png",
      "https://mvmkybzjlmfhuaqrtlii.supabase.co/storage/v1/object/public/profile-images//7.png",
      "https://mvmkybzjlmfhuaqrtlii.supabase.co/storage/v1/object/public/profile-images//8.png",
      "https://mvmkybzjlmfhuaqrtlii.supabase.co/storage/v1/object/public/profile-images//9.png",
      "https://mvmkybzjlmfhuaqrtlii.supabase.co/storage/v1/object/public/profile-images//10.png",
    ]);
  }, []);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);


  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentAddress || !scholarshipAddress) return;

      setLoading(true);
      try {
        // Fetch student profile from database
        const response = await fetch('/api/fetchUserData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: studentAddress,
            role: 'Student'
          }),
        });

        const data = await response.json();
        
        if (response.ok && data.status === 200) {
          setStudent(data.data);
        } else {
          console.error("Error fetching student data:", data.error);
        }

        const provider = new ethers.JsonRpcProvider("https://sepolia-rpc.scroll.io/");
        const scholarshipContract = new ethers.Contract(
          scholarshipAddress,
          scholarship_ABI,
          provider
        );

        // Get scholarship title
        const title = await scholarshipContract.title();
        setScholarshipTitle(title);

        // Get student application status and funds withdrawn
        const studentApplication = await scholarshipContract.studentApplications(studentAddress);
        setIsApproved(studentApplication.isApproved);
        setFundsWithdrawn(ethers.formatEther(studentApplication.fundsWithdrawn));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentAddress, scholarshipAddress]);

  // Function to approve student
  const handleApproveStudent = async () => {
    if (!studentAddress || !scholarshipAddress) return;

    try {
      // Get wallet from localStorage
      const walletAddress = localStorage.getItem('walletAddress');
      if (!walletAddress) {
        alert("Please connect your wallet first");
        return;
      }

      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        const scholarshipContract = new ethers.Contract(
          scholarshipAddress,
          scholarship_ABI,
          signer
        );

        // Call the approveStudent function
        const tx = await scholarshipContract.approveStudent(studentAddress);
        
        await tx.wait();
        
        setIsApproved(true);
        alert("Student approved successfully!");
      } else {
        alert("Please install MetaMask or another Ethereum wallet");
      }
    } catch (error) {
      console.error("Error approving student:", error);
      alert("Failed to approve student. See console for details.");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        username={user?.username || ""}
        profileImage={user?.avatar_url || ""}
        role={role}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />

      <div className={`flex-1 ${sidebarOpen ? "ml-6" : "ml-0"} transition-all`}>
        <div className="min-h-screen p-6 bg-[#F0EBE3]">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Applicant Details</h1>
          </div>

          {/* Action Buttons */}
          <div className="p-6 pb-3 flex justify-between items-center">
            <Button variant="outline" size="sm" asChild>
                {/* Have issue on cant route back to list page, due to need to create a page to render back to component file */}
                <Link href="/company/dashboard">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Applicant lists
                </Link>
            </Button>
            
            {!isApproved && (
              <Button 
                variant="default" 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleApproveStudent}
              >
                <Check className="w-4 h-4 mr-1" /> Approve Student
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-lg">Loading student data...</p>
            </div>
          ) : !student ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-lg">Student data not found</p>
            </div>
          ) : (
            <div className="p-6 pt-3 space-y-6">
              {/* Scholarship Details Card */}
              <Card className="shadow-lg border border-gray-200 rounded-lg">
                <CardHeader className="border-b border-gray-200 pb-4 bg-gray-50">
                  <CardTitle className="text-xl font-semibold text-gray-700">Scholarship Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-col space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Scholarship Title:</span>
                      <p className="text-lg font-medium text-gray-800">{scholarshipTitle}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Application Status:</span>
                      <span className={`inline-block ml-2 px-3 py-1 text-sm font-medium rounded-full ${
                        isApproved 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {isApproved ? "Approved" : "Pending Approval"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Funds Withdrawn:</span>
                      <p className="text-lg font-medium text-gray-800">{fundsWithdrawn} ETH</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student Profile Card */}
              <Card className="shadow-lg border border-gray-200 rounded-lg">
                <CardHeader className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                        <img 
                          src={avatarImages[parseInt(student.avatar_url) || 0]} 
                          alt={student.username} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-800">{student.username}</CardTitle>
                        <CardDescription className="text-gray-600 mt-1">
                          Here is the applicant's detail
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Field of Study</label>
                        <p className="text-lg font-semibold text-gray-800">{student.field_of_study}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Academic Progression</label>
                        <p className="text-lg font-semibold text-gray-800">{student.academic_progression}</p>
                      </div>
                      {student.portfolio_url && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Portfolio</label>
                          <p className="text-lg font-semibold text-blue-600 hover:underline">
                            <a href={student.portfolio_url} target="_blank" rel="noopener noreferrer">
                              View Portfolio
                            </a>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Description</label>
                        <p className="text-gray-700 leading-relaxed">{student.description}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
