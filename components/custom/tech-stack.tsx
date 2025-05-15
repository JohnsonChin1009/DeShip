"use client";

import { techStackData } from "@/data/techStack";
import Image from "next/image";

export default function TechStack() {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {techStackData.map((tech) => (
                    <div
                        key={tech.id}
                        className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-[#D3E9F0] rounded-lg flex items-center justify-center">
                                <Image
                                    src={tech.image}
                                    alt={tech.title}
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-[#4A3F8F]">{tech.title}</span>
                                <span className="text-sm text-gray-600">{tech.category}</span>
                            </div>
                        </div>
                        <p className="text-gray-700">{tech.description}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
