"use client";

import RoleCard from "@/components/custom/RoleCard";
import PrivyButton from "@/components/custom/PrivyButton";
import SignUpForm from "@/components/custom/SignUpForm";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SignUpPage() {
  const { user } = usePrivy();
  const walletAddress = user?.wallet?.address;
  const [selectedRole, setSelectedRole] = useState<string | "">("");
  const [step, setStep] = useState<"selectRole" | "registerDetails">("selectRole");

  useEffect(() => {
    console.log("User address:", walletAddress);
    console.log("Selected role:", selectedRole); // TO REMOVE;
  }, [walletAddress, selectedRole]);

  const handleBackRoleSelect = () => {
    setSelectedRole("");
    setStep("selectRole");
  }

  const handleRoleSelect = async (role: string) => {
    setSelectedRole(role);
    setStep("registerDetails");
  };

  return (
    <>
      <main className="relative min-h-screen flex flex-col space-y-10 items-center justify-center text-center bg-[#F0EBE3] px-4 md:px-8 lg:px-16 py-10">
        {/* Top Right Privy Button */}
        <div className="absolute top-6 right-6">
          <PrivyButton />
        </div>
        {/* Page Content */}

        {/* Role Selection Section */}
        {step === "selectRole" && (
          <>
            <div className="flex flex-col space-y-3">
              <h1 className="text-3xl font-black text-black">Greetings!</h1>
              <p className="text-lg text-black">
                Please choose your preferred role
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mx-auto">
              <RoleCard
                role="Student"
                image="/student.png"
                description="Looking for opportunities? Create an account and start applying for scholarships with equal opportunities."
                onSelectRole={handleRoleSelect}
              />
              <RoleCard
                role="Company"
                image="/company.png"
                description="Ready to play a part in shaping the future? Invest in the next generation of talent and pay it forward."
                onSelectRole={handleRoleSelect}
              />
            </div>
          </>
        )}

        {/* Registration Form Section */}
        {step === "registerDetails" && (
            <div className="flex justify-center items-start gap-10 w-full">
              {/* Left Panel */}
              <div className="w-1/2 relative">
              {/* Absolute Back Button */}
              <Button variant="secondary" className="absolute top-0 left-0 text-[16px] font-bold" onClick={handleBackRoleSelect}>
                <ArrowLeft className="mr-2" />
                Back
              </Button>

              {/* Actual Content below the button */}
              <div className="pt-14"> {/* Adds padding to push RoleCard below button */}
                <RoleCard
                  role={selectedRole}
                  image={selectedRole === "Student" ? "/student.png" : "/company.png"}
                  description={
                    selectedRole === "Student"
                      ? "Looking for opportunities? Create an account and start applying for scholarships with equal opportunities."
                      : "Ready to play a part in shaping the future? Invest in the next generation of talent and pay it forward."
                  }
                  onSelectRole={() => setStep("selectRole")}
                  isLocked
                />
              </div>
            </div>

            {/* Right Panel */}
            <div className="w-1/2">
              <SignUpForm role={selectedRole} walletAddress={walletAddress} />
            </div>
          </div>
        )}
      </main>
    </>
  );
}