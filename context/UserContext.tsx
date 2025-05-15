"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

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

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/fetchUserData", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: localStorage.getItem("walletAddress"), role: localStorage.getItem("userRole")}),
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const response = await res.json();
        const data = response.data;
        setUser(data); // Assuming your API returns { ...userData, ...profileData }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        router.push("/sign-up"); // or login route
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

   // New function to refetch user data on demand
   const refetchUserData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/fetchUserData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: localStorage.getItem("walletAddress"), role: localStorage.getItem("userRole") }),
      });

      if (!res.ok) throw new Error("Failed to fetch profile");

      const response = await res.json();
      const data = response.data;
      setUser(data);
    } catch (error) {
      console.error("Error refetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, refetchUserData }}>
      {children}
    </UserContext.Provider>
  );
};