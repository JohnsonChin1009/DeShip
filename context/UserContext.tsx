"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

type Role = "Student" | "Company";

interface UserProfile {
  wallet_address: string;
  username: string;
  description: string;
  avatar_url?: string;
  role: Role;
  academic_progression?: string;
  field_of_study?: string;
  portfolio_url?: string;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  loading: boolean;
  refetchUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
  refetchUserData: () => Promise.resolve(),
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const { authenticated, ready, user: privyUser } = usePrivy();
  const router = useRouter();
  
  const lastFetchTime = useRef<number>(0);
  const isFetching = useRef<boolean>(false);
  const fetchCount = useRef<number>(0);
  const currentWalletAddress = useRef<string | null>(null);

  // Track wallet address changes
  useEffect(() => {
    if (privyUser?.wallet?.address) {
      // If wallet address changes, reset user state
      if (currentWalletAddress.current !== null && 
          currentWalletAddress.current !== privyUser.wallet.address) {
        console.log("Detected wallet address change in context");
        setUser(null);
        setInitialFetchDone(false);
        fetchCount.current = 0;
      }
      
      currentWalletAddress.current = privyUser.wallet.address;
    }
  }, [privyUser?.wallet?.address]);

  // Attempt to restore user from sessionStorage on initial load
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialFetchDone) {
      try {
        const walletAddress = localStorage.getItem("walletAddress");
        const userRole = localStorage.getItem("userRole");
        
        // Only restore cache if wallet address matches current Privy user
        const shouldRestoreCache = 
          walletAddress && 
          userRole && 
          (!privyUser?.wallet?.address || privyUser.wallet.address === walletAddress);
        
        if (shouldRestoreCache) {
          const cacheKey = `${walletAddress}-${userRole}`;
          const cachedData = sessionStorage.getItem(cacheKey);
          
          if (cachedData) {
            setUser(JSON.parse(cachedData));
            setLoading(false);
            setInitialFetchDone(true);
          }
        }
      } catch (error) {
        console.error("Error restoring user from cache:", error);
      }
    }
  }, [initialFetchDone, privyUser?.wallet?.address]);

  const fetchUser = useCallback(async (force = false) => {
    if (typeof window === 'undefined') return;
    
    const now = Date.now();
    if (now - lastFetchTime.current < 1000 && !force) {
      console.log("Throttling fetch request");
      return;
    }
    
    // Prevent concurrent fetches
    if (isFetching.current) {
      console.log("Already fetching user data");
      return;
    }
    
    if (fetchCount.current > 5) {
      console.log("Too many fetch attempts, stopping");
      fetchCount.current = 0;
      return;
    }

    if (user !== null && 
        privyUser?.wallet?.address && 
        user.wallet_address === privyUser.wallet.address && 
        !force) {
      setLoading(false);
      return;
    }

    // Get from localStorage - prioritize privyUser's wallet address
    const walletAddress = 
      privyUser?.wallet?.address || 
      localStorage.getItem("walletAddress");
    
    const userRole = localStorage.getItem("userRole");
    
    if (!walletAddress || !userRole) {
      setLoading(false);
      return;
    }

    // Ensure localStorage is up to date with privyUser if available
    if (privyUser?.wallet?.address && privyUser.wallet.address !== localStorage.getItem("walletAddress")) {
      localStorage.setItem("walletAddress", privyUser.wallet.address);
    }
    
    try {
      isFetching.current = true;
      lastFetchTime.current = now;
      fetchCount.current += 1;
      setLoading(true);
      
      if (!force) {
        const cacheKey = `${walletAddress}-${userRole}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          
          // Only use cache if it matches current wallet
          if (parsedData.wallet_address === walletAddress) {
            setUser(parsedData);
            setLoading(false);
            setInitialFetchDone(true);
            return;
          }
        }
      }
      
      const res = await fetch("/api/fetchUserData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, role: userRole }),
      });

      if (!res.ok) throw new Error("Failed to fetch profile");

      const response = await res.json();
      const data = response.data;
      
      // Cache the response to prevent duplicate fetches
      const cacheKey = `${walletAddress}-${userRole}`;
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
      
      setUser(data);
      fetchCount.current = 0;
    } catch (error: unknown) {
      console.error("Error fetching user profile:", error);
      if (authenticated) {
        if (error instanceof Error && error.message === "Failed to fetch profile") {
          setUser(null);
          localStorage.removeItem("userData");
        }
        router.push("/sign-up");
      }
    } finally {
      setLoading(false);
      setInitialFetchDone(true);
      isFetching.current = false;
    }
  }, [authenticated, privyUser, user, router]);

  // Initial fetch when component mounts or when Privy state changes
  useEffect(() => {
    if (!ready) return;
    
    if (authenticated && privyUser?.wallet?.address) {
      const walletMatchesUser = 
        user !== null && user.wallet_address === privyUser.wallet.address;
      
      if (!walletMatchesUser) {
        fetchUser();
      }
    } else if (ready && !authenticated) {
      setLoading(false);
      if (!initialFetchDone) {
        setInitialFetchDone(true);
      }
    }
  }, [ready, authenticated, privyUser, fetchUser, user]);

  const refetchUserData = useCallback(async () => {
    fetchCount.current = 0;
    
    if (typeof window !== 'undefined') {
      const walletAddress = 
        privyUser?.wallet?.address || 
        localStorage.getItem("walletAddress");
        
      const userRole = localStorage.getItem("userRole");
      
      if (walletAddress && userRole) {
        // Only clear the specific user's cache
        const cacheKey = `${walletAddress}-${userRole}`;
        sessionStorage.removeItem(cacheKey);
      }
    }
    
    await fetchUser(true);
  }, [fetchUser, privyUser]);

  const contextValue = useCallback(() => {
    return { 
      user, 
      setUser, 
      loading, 
      refetchUserData 
    };
  }, [user, loading, refetchUserData]);

  return (
    <UserContext.Provider value={contextValue()}>
      {children}
    </UserContext.Provider>
  );
};