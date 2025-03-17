"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { roleNFT_CA, roleNFT_ABI } from "@/lib/roleNFT";
import { useRouter } from "next/navigation";

export default function PrivyButton() {
    const { ready, authenticated, login, logout, user } = usePrivy();
    const [hasUserRole, setHasUserRole] = useState<undefined | boolean>(undefined);
    const [isCheckingRole, setIsCheckingRole] = useState(false);
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
                    console.log("🔍 Contract response:", result);
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
        console.log("✅ Authenticated:", authenticated);
        console.log("⏳ Checking role:", isCheckingRole);
        console.log("🎭 User has NFT:", hasUserRole);

        if (!authenticated) {
            console.log("🔄 Redirecting to /");
            hasRedirected.current = false;
            router.replace("/");
            return;
        }

        // Only redirect when role checking is finished and hasUserRole is defined
        if (!isCheckingRole && hasUserRole !== undefined && !hasRedirected.current) {
            hasRedirected.current = true;
            if (hasUserRole) {
                console.log("✅ Redirecting to dashboard...");
                router.replace("/dashboard");
            } else {
                console.log("❌ Redirecting to sign-up...");
                router.replace("/sign-up");
            }
        }
    }, [authenticated, hasUserRole, isCheckingRole, router]);

    if (!ready) {
        return <button disabled className="primary-button">Loading...</button>;
    }

    return authenticated ? (
        <div>
            <button
                onClick={logout}
                className="primary-button"
            >
                {isCheckingRole
                    ? "Checking Role..."
                    : user?.wallet?.address
                    ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
                    : "Disconnect"}
            </button>
        </div>
    ) : (
        <button onClick={login} className="primary-button">
            Connect Wallet
        </button>
    );
}