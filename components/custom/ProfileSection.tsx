"use client";

import Image from "next/image";
import { useUser } from "@/context/UserContext";

export default function ProfileSection() {
  const { user } = useUser();
  
  console.log("User data:", user);
  return (
    <>
      {/* Section Wrapper */}
      <div className="p-4">
        {/* Profile Section*/}
        <div className="flex flex-col space-x-2">
          {/* Profile Image */}
          <div>
            <Image 
              src={user?.avatar_url || "https://avatars.githubusercontent.com/u/107231772?v=4"}
              alt="Profile Image"
              width={160}
              height={160}
              className="rounded-full"
            />
          </div>
          {/* Username + Role */}
          <div className="flex flex-col space-y-1">
            <h1 className="text-md font-bold">{user?.username}</h1>
            <h2 className="text-sm font-medium">{user?.description}</h2>
            <div>
              {user?.role}
            </div>
            <div>
            {user?.academic_progression}
            </div>
            <div>
              Software Engineering
            </div>
            <div>
            {user?.portfolio_url}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}