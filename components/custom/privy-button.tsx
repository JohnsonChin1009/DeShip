"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { roleNFT_CA, roleNFT_ABI } from "@/lib/contractABI";
import { useRouter } from "next/navigation";

export default function PrivyButton() {
    const { ready, authenticated, login, logout, user } = usePrivy();
    const [ hasUserRole, setHasUserRole ] = useState<undefined | boolean>(undefined);
    const [ isCheckingRole, setIsCheckingRole ] = useState(false);
    const [ dropdownOpen, setDropdownOpen ] = useState(false);
    const router = useRouter();
    const hasRedirected = useRef(false);
    
    // Create contract instance only once using useMemo
    const contract = useMemo(() => {
        const provider = new ethers.JsonRpcProvider("https://sepolia-rpc.scroll.io/");
        return new ethers.Contract(roleNFT_CA, roleNFT_ABI, provider);
    }, []);

    // Check NFT ownership in an effect to handle async properly
    useEffect(() => {
        async function checkUserRole() {
            if (authenticated && user?.wallet?.address) {
                setIsCheckingRole(true);
                try {
                    const result = await contract.hasRoleNFT(user.wallet.address);

                    if (!result) {
                        console.error("User does not have role NFT");
                    }

                    const role = await contract.getUserRole(user.wallet.address);

                    if (!role) {
                        console.error("Error fetching user role from contract");
                    }
                    
                    localStorage.setItem("userRole", role);
                    setHasUserRole(result);
                } catch (error) {
                    console.error("❌ Error checking role NFT:", error);
                } finally {
                    setIsCheckingRole(false);
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

        if (!isCheckingRole && hasUserRole !== undefined && !hasRedirected.current) {
            hasRedirected.current = true;
            if (hasUserRole) {
                router.replace("/dashboard");
            } else {
                router.replace("/sign-up");
            }
        }
    }, [authenticated, hasUserRole, isCheckingRole, router]);

    if (!ready) {
        return <button disabled className="primary-button">Loading...</button>;
    }

    return authenticated ? (
        <div className="relative inline-block">
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="primary-button"
            >
                {isCheckingRole
                    ? "Checking Role..."
                    : user?.wallet?.address
                    ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
                    : "Menu"}
            </button>
            {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
                    <button
                        onClick={logout}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-200"
                    >
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    ) : (
        <button onClick={login} className="primary-button">
            Connect Wallet
        </button>
    );
}