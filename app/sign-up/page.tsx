"use client";

import RoleCard from "@/components/custom/role-card";
import PrivyButton from "@/components/custom/privy-button";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

export default function SignUpPage() {
    const { user } = usePrivy();
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const walletAddress = user?.wallet?.address;

    useEffect(() => {
        console.log("User address:", walletAddress);
        console.log("Selected role:", selectedRole); // TO REMOVE;
    }, [walletAddress, selectedRole]);

    const handleRoleSelect = async (role: string) => {
        console.log("Selected role:", role);
        setSelectedRole(role);
    
        // Ensure we only call the API when both walletAddress and selectedRole exist
        if (!walletAddress) {
            console.error("Wallet address is missing. Cannot mint NFT.");
            return;
        }

        try {
            const response = await fetch("/api/mintRoleNFT", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ walletAddress, role })
            });

            if (!response.ok) {
                throw new Error("Error minting NFT for User");
            }

            const data = await response.json();
            console.log("Mint NFT Response", data);
        } catch (error) {
            console.error("Error minting NFT:", error);
        }
    };


    return (
        <>
            <main className="relative min-h-screen flex flex-col space-y-10 items-center justify-center text-center bg-[#F0EBE3] px-4 md:px-8 lg:px-16 py-10">
                {/* Top Right Privy Button */}
                <div className="absolute top-6 right-6">
                    <PrivyButton />
                </div>
                
                {/* Page Content */}
                <div className="flex flex-col space-y-3">
                    <h1 className="text-3xl font-black text-black">Greetings!</h1>
                    <p className="text-lg text-black">Please choose your preferred role</p>
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
            </main>
        </>
    );
}