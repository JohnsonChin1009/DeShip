"use client";

import Image from "next/image";

interface RoleCardProps {
  role: string;
  description: string;
  image: string;
  onSelectRole: (role: string) => void; // Function to return the role to the parent
}

export default function RoleCard({ role, image, description, onSelectRole }: RoleCardProps) {
  return (
    <div
      onClick={() => onSelectRole(role)} // Call the function with the selected role
      className="bg-white w-full lg:w-[500px] xl:w-[600px] border-2 border-gray-200 hover:border-highlight 
                 rounded-2xl flex flex-col hover:-translate-y-2 items-center justify-center text-center p-8 
                 shadow-sm hover:shadow-lg transition-shadow space-y-2 cursor-pointer"
    >
      <div className="relative w-20 h-20 mx-auto">
        <Image src={image} alt={role} fill className="object-contain rounded-lg" />
      </div>
      <h3 className="text-xl lg:text-2xl text-black font-bold">{role}</h3>
      <p className="text-gray-600 font-medium text-sm max-w-xs">{description}</p>
    </div>
  );
}