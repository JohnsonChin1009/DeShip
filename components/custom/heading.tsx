"use client";

import { LuMenu } from "react-icons/lu";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function Heading() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleLinkClick = () => {
        setIsMenuOpen(false);
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isMenuOpen]);

    return (
        <>
            <div className="relative py-4 flex justify-between px-4 md:px-8 lg:px-16 lg:py-8">
                {/* Logo */}
                <Link href="/" className="font-black text-xl">
                    deShip
                </Link>

                {/* Mobile Menu Button */}
                <button className={`lg:hidden text-2xl transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <LuMenu /> : <LuMenu />}
                </button>

                {/* Mobile Menu */}
                <nav 
                    ref={menuRef}
                    className={`py-4 absolute top-full left-0 w-full space-y-10 text-xl text-center bg-stroke 
                    transition-transform ease-in-out duration-300 transform 
                    ${isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"}`}
                >
                    {links.map((link) => (
                        <div key={link.id}>
                            <Link href={link.href} onClick={handleLinkClick}>{link.name}</Link>
                        </div>
                    ))}
                </nav>

                {/* Desktop Links */}
                <nav className="hidden lg:flex lg:items-center lg:space-x-10">
                    {links.map((link) => (
                        <Link key={link.id} href={link.href} onClick={handleLinkClick} className="hover:font-bold hover:text-[#b8c1ec]">{link.name}</Link>
                    ))}
                </nav>

            </div>
        </>
    )
}

const links = [
    {
        id: 1,
        name: "about",
        href: "#why-deship",
    },
    {
        id: 2,
        name: "how it works",
        href: "#how-it-works",
    },
    {
        id: 3,
        name: "tech stack",
        href: "#tech-stack",
    }
]