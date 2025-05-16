"use client";

import Image from "next/image";

const teamMembers = [
    {
        id: 1,
        name: "Johnson Chin",
        role: "Fullstack Developer",
        image: "/johnson-notion.png"
    },
    {
        id: 2,
        name: "Thien Wei Jian",
        role: "Fullstack Developer",
        image: "/aiden-notion.png"
    },
    {
        id: 3,
        name: "John Paulose",
        role: "Fullstack Developer",
        image: "/john-notion.png"
    },
    {
        id: 4,
        name: "Ivan Wong Hong Zheng",
        role: "Fullstack Developer",
        image: "/ivan-notion.png"
    }
];

export default function Team() {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {teamMembers.map((member) => (
                    <div key={member.id} className="flex flex-col items-center">
                        <div className="relative w-48 h-48 mb-4 rounded-full overflow-hidden group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-white rounded-full p-1 w-full h-full">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    className="object-cover rounded-full transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-highlight">{member.name}</h3>
                        <p className="text-[#D8D8D8] text-center">{member.role}</p>
                    </div>
                ))}
            </div>
        </div>
    );
} 