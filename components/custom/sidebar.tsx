"use client";

import { useState } from "react";
import { usePrivy } from '@privy-io/react-auth';
import Link from "next/link";

export default function Sidebar() {
    return (
        <>
            <nav className="w-full">
                {items.map((item) => (
                    <div key={item.id}>
                        <Link href={item.href} className="hover:font-bold">{item.title}</Link>
                    </div>
                ))}
            </nav>
        </>
    )
}

const items = [
    {
        id: 1,
        title: "Dashboard",
        href: "/dashboard",
    }
]