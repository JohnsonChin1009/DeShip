"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { roleNFT_CA, roleNFT_ABI } from "@/lib/contractABI";
import { useRouter, usePathname } from "next/navigation";

export default function PrivyButton() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Create contract instance only once using useMemo
  const contract = useMemo(() => {
    const provider = new ethers.JsonRpcProvider(
      "https://sepolia-rpc.scroll.io/"
    );
    return new ethers.Contract(roleNFT_CA, roleNFT_ABI, provider);
  }, []);

  const handleLogout = async () => {
    await logout();

    setDropdownOpen(false);
    localStorage.removeItem("userRole");
    router.refresh();
  }

  // Check if user has the role NFT and redirect accordingly
  useEffect(() => {
    if (pathname !== "/") return;

    const checkAndRedirect = async () => {
      if (authenticated && user?.wallet?.address) {
        try {
          const hasNFT = await contract.hasRoleNFT(user.wallet.address);

          if (!hasNFT) {
            router.replace("/sign-up");
            return;
          }

          const role = await contract.getUserRole(user.wallet.address);
          localStorage.setItem("userRole", role);
          router.replace("/dashboard");
          } catch (error) {
            console.error("Error during login with Privy:", error);
          }
        }
      }

      checkAndRedirect();
    }, [authenticated, user, contract, router, pathname])

  // Function to close dropdown when clicking outside (after authenicated)
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
