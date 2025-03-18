"use client";

import Link from "next/link";
import { FaGithub } from "react-icons/fa6";


export default function Footer() {
    return (
        <>
            <footer className="py-4 flex bg-[#232946] justify-between px-4 md:px-8 lg:px-16 lg:py-8 items-center text-center text-highlight">
                {/* deShip Logo */}
                <Link href="/" className="font-black text-lg">
                    deShip
                </Link>
                
                {/* Copyright Section */}
                <div className="text-sm md:text-base max-w-[50%]">
                    all rights reserved <span className="inline-block">© deShip 2025</span>
                </div>

                {/* Links Section */}
                <Link href="https://github.com/JohnsonChin1009/DeShip" target="_blank">
                    <FaGithub className="text-2xl lg:text-3xl hover:text-white"/>
                </Link>
            </footer>
        </>
    )
}