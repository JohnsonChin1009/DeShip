"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { roleNFT_CA, roleNFT_ABI } from "@/lib/contractABI";
import { useRouter } from "next/navigation";

export default function PrivyButton() {
    const { ready, authenticated, login, logout, user } = usePrivy();
    const [ hasUserRole, setHasUserRole ] = useState<undefined | boolean>(undefined);
    const [ dropdownOpen, setDropdownOpen ] = useState(false);
    const router = useRouter();
    const hasRedirected = useRef(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // Create contract instance only once using useMemo
    const contract = useMemo(() => {
        const provider = new ethers.JsonRpcProvider("https://sepolia-rpc.scroll.io/");
        return new ethers.Contract(roleNFT_CA, roleNFT_ABI, provider);
    }, []);

    // Check NFT ownership in an effect to handle async properly
    useEffect(() => {
        async function checkUserRole() {
            if (authenticated && user?.wallet?.address) {
                try {
                    const result = await contract.hasRoleNFT(user.wallet.address);

                    if (!result) {
                        console.log("User does not have role NFT");
                    }

                    const role = await contract.getUserRole(user.wallet.address);

                    if (!role) {
                        console.error("Error fetching user role from contract");
                    }
                    
                    localStorage.setItem("userRole", role);
                    setHasUserRole(result);
                } catch (error) {
                    console.error("❌ Error checking role NFT:", error);
                }
            }
        }
        
        if (authenticated && user?.wallet?.address) {
            checkUserRole();
        }
    }, [authenticated, user, contract]);

    // Handle routing based on user role - use ref to prevent multiple redirects
    useEffect(() => {
        if (!authenticated) {
            hasRedirected.current = false;
            router.replace("/");
            return;
        }

        if (hasUserRole !== undefined && !hasRedirected.current) {
            hasRedirected.current = true;
            if (hasUserRole) {
                router.replace("/dashboard");
            } else {
                router.replace("/sign-up");
            }
        }
    }, [authenticated, hasUserRole, router]);

    // Function to close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (!ready) {
        return <button disabled className="primary-button">Loading...</button>;
    }

    return authenticated ? (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="border-2 border-gray-300 hover:border-2 px-4 py-2 text-[13px] flex items-center justify-center gap-2 rounded-xl  hover:border-[#1C1C1C]"
            >
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                {user?.wallet?.address
                    ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
                    : "Menu"}
            </button>
            {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-transparent border border-gray-300 rounded-xl shadow-lg z-50">
                    <button
                        onClick={logout}
                        className="block w-full px-3 py-2 text-center hover:font-medium"
                    >
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    ) : (
        <button onClick={login} className="landing-button">
            Connect Wallet
        </button>
    );
}
