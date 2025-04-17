"use client";

import Image from "next/image";

interface RoleCardProps {
  role: string;
  description: string;
  image: string;
  onSelectRole: (role: string) => void;
  isSelected?: boolean;
  isLocked?: boolean;
}

export default function RoleCard({
  role,
  image,
  description,
  onSelectRole,
  isSelected = false,
  isLocked = false,
}: RoleCardProps) {
  const handleClick = () => {
    if (!isLocked) {
      onSelectRole(role);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`w-full lg:w-[500px] xl:w-[600px] rounded-2xl flex flex-col items-center justify-center text-center p-8
        shadow-sm space-y-2 duration-300
        ${
          isSelected
            ? "bg-blue-100 border-blue-500 border-2"
            : "bg-white border-2 border-gray-200"
        }
        ${!isLocked && !isSelected ? "hover:border-highlight hover:-translate-y-2 hover:shadow-lg cursor-pointer" : ""}
        ${isLocked ? "cursor-default" : ""}
      `}
    >
      <div className="relative w-20 h-20 mx-auto">
        <Image
          src={image}
          alt={role}
          fill
          className="object-contain rounded-lg"
        />
      </div>
      <h3 className="text-xl lg:text-2xl text-black font-bold">
        {isSelected ? `${role} (Selected)` : role}
      </h3>
      <p className="text-gray-600 font-medium text-sm max-w-xs">{description}</p>
    </div>
  );
}