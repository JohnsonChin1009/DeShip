"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { roleNFT_CA, roleNFT_ABI } from "@/lib/contractABI";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function PrivyButton() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { refetchUserData, user: contextUser, setUser } = useUser();
  const checkAttempts = useRef(0);
  const lastCheckTime = useRef(0);
  const previousWalletAddress = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Create contract instance only once using useMemo
  const contract = useMemo(() => {
    const provider = new ethers.JsonRpcProvider(
      "https://sepolia-rpc.scroll.io/"
    );
    return new ethers.Contract(roleNFT_CA, roleNFT_ABI, provider);
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();

    setDropdownOpen(false);
    localStorage.removeItem("userRole");
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("userData");
    
    // Clear context user
    setUser(null);
    
    // Clear session storage to prevent stale data
    if (typeof window !== 'undefined') {
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('-Student') || key.includes('-Company')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    // Reset states
    previousWalletAddress.current = null;
    checkAttempts.current = 0;
    
    setIsLoading(false);
    router.refresh();
  }

  // Detect wallet address change
  useEffect(() => {
    if (ready && authenticated && user?.wallet?.address) {
      // If wallet address changed, clear context and localStorage
      if (previousWalletAddress.current !== null && 
          previousWalletAddress.current !== user.wallet.address) {
        console.log("Wallet address changed, resetting state");
        
        // Clear context data
        setUser(null);
        
        checkAttempts.current = 0;
        
        // Update localStorage with new address
        localStorage.setItem("walletAddress", user.wallet.address);
        localStorage.removeItem("userRole");
        
        // Clear session storage for previous wallet
        if (typeof window !== 'undefined') {
          Object.keys(sessionStorage).forEach(key => {
            if (key.includes('-Student') || key.includes('-Company')) {
              sessionStorage.removeItem(key);
            }
          });
        }
      }
      
      // Update previous wallet address
      previousWalletAddress.current = user.wallet.address;
    }
  }, [ready, authenticated, user, setUser]);

  // Check user role and set localStorage immediately when authenticated
  const checkUserRole = async () => {
    if (!authenticated || !user?.wallet?.address || isCheckingRole) return;
    
    // We have valid context user data and it matches current wallet - no need to check
    if (contextUser !== null && 
        contextUser.wallet_address === user.wallet.address) {
      return;
    }
    
    const now = Date.now();
    if (now - lastCheckTime.current < 1000) {
      console.log("Rate limiting role check");
      return;
    }
    
    if (checkAttempts.current > 5) {
      console.log("Exceeded maximum check attempts");
      return;
    }
    
    try {
      setIsCheckingRole(true);
      lastCheckTime.current = now;
      checkAttempts.current += 1;
      
      // Always update localStorage with current wallet address when available
      if (user.wallet.address) {
        localStorage.setItem("walletAddress", user.wallet.address);
      }
      
      // Check if user already has a role in localStorage
      const existingRole = localStorage.getItem("userRole");
      
      if (existingRole && 
          localStorage.getItem("walletAddress") === user.wallet.address) {
        console.log("Found existing role:", existingRole);
        
        await refetchUserData();
        
        if (pathname === "/" || pathname === "/sign-up") {
          router.replace("/dashboard");
        }
        return;
      }
      
      const hasNFT = await contract.hasRoleNFT(user.wallet.address);

      if (!hasNFT) {
        // if user doesn't have an NFT
        localStorage.removeItem("userRole");
        
        if (pathname !== "/sign-up") {
          router.replace("/sign-up");
        }
        return;
      }

      const role = await contract.getUserRole(user.wallet.address);
      localStorage.setItem("userRole", role);
      
      // Refresh user data in context
      await refetchUserData();
      
      if (pathname === "/" || pathname === "/sign-up") {
        router.replace("/dashboard");
      }
      
      checkAttempts.current = 0;
    } catch (error) {
      console.error("Error checking user role:", error);
    } finally {
      setIsCheckingRole(false);
    }
  };

  // Run role check whenever authentication or user changes
  useEffect(() => {
    // Only run check once Privy is ready and authenticated
    if (ready && authenticated && user?.wallet?.address) {
      const shouldCheck = 
        contextUser === null || 
        contextUser.wallet_address !== user.wallet.address;
        
      if (shouldCheck) {
        checkUserRole();
      } else {
        checkAttempts.current = 0;
      }
    }
  }, [authenticated, user, ready, contextUser]);

  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!ready) {
    return (
      <button disabled className="primary-button">
        Loading...
      </button>
    );
  }

  if (isLoading) {
    return (
      <button disabled className="primary-button">
        Disconnecting...
      </button>
    );
  }

  return authenticated ? (
    <div className="relative inline-block w-full" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-full border-2 border-gray-300 hover:border-2 px-4 py-2 text-[13px] flex items-center justify-center gap-2 rounded-xl  hover:border-[#2c2c2c] duration-200"
      >
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        {user?.wallet?.address
          ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(
              -4
            )}`
          : "Menu"}
      </button>
      {dropdownOpen && (
        <div className="absolute bottom-full mb-2 left-0 w-full bg-white border border-gray-300 rounded-xl shadow-lg z-50 hover:-translate-y-1 duration-300 hover:border-[#2c2c2c]">
          <button
            onClick={handleLogout}
            className="block w-full px-3 py-2 text-center hover:font-semibold"
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
