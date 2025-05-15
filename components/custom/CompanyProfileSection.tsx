"use client";

import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Building2, Link, Wallet, Pencil } from "lucide-react";

export default function ProfileSection() {
    const { user } = useUser();
    const router = useRouter();


    if (!user) return <div className="p-6">Loading company profile...</div>;

    // Cast user to any temporarily to access company-specific fields safely
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userAny = user as any;

    const avatarUrl = user.avatar_url?.startsWith("http")
        ? user.avatar_url
        : "https://avatars.githubusercontent.com/u/107231772?v=4";

    return (
        <div className="p-6">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>Company Profile</CardTitle>
                        <CardDescription>
                            View your registered company details.
                        </CardDescription>
                    </div>
                    <Button
                        onClick={() => router.push("/edit-profile")}
                        className="flex gap-2"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit Profile
                    </Button>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                        {/* Company Avatar */}
                        <Image
                            src={avatarUrl}
                            alt="Company Logo"
                            width={180}
                            height={180}
                            className="rounded-full border border-gray-300 shadow-sm"
                        />

                        {/* Company Info */}
                        <div className="w-full flex flex-col space-y-4">
                            <div className="text-lg font-semibold text-gray-900">
                                {user.username || "Company Name"}
                            </div>

                            <p className="text-gray-700 text-sm">
                                {user.description || "No description provided."}
                            </p>

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Building2 className="w-4 h-4 text-gray-500" />
                                <span>
                                    <strong>Industry:</strong>{" "}
                                    {Array.isArray(userAny.industry)
                                        ? userAny.industry.join(", ")
                                        : userAny.industry || "N/A"}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600 break-words">
                                <Wallet className="w-4 h-4 text-gray-500" />
                                <span>
                                    <strong>Wallet:</strong> {user.wallet_address || "N/A"}
                                </span>
                            </div>

                            {userAny.website_url && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Link className="w-4 h-4 text-gray-500" />
                                    <a
                                        href={userAny.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline break-all"
                                    >
                                        {userAny.website_url}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
