"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { industryOptions } from "@/lib/types/profile";

interface CompanyProfileEditDialogProps {
    open: boolean;
    setOpen: (value: boolean) => void;
    companyData: {
        name: string;
        description: string;
        website: string;
        industry: string;
        walletAddress: string;
        avatarURL?: string;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate: (updatedData: any) => Promise<boolean>;
}


export function CompanyProfileEditDialog({
    companyData,
    onUpdate,
}: CompanyProfileEditDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Separate editable and non-editable data
    const { walletAddress } = companyData;
    const [formData, setFormData] = useState({
        name: companyData.name,
        description: companyData.description,
        website: companyData.website,
        industry: companyData.industry.length > 0 ? companyData.industry[0] : "",
        avatarURL: companyData.avatarURL,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                industry: [formData.industry],
                walletAddress,
            };

            const res = await fetch("/api/editCompanyProfile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const updateSuccess = await onUpdate(payload);
                if (updateSuccess) {
                    toast({
                        title: "Success",
                        description: "Company profile updated successfully!",
                        variant: "default",
                        className:
                            "border-l-4 border-green-500 top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4",
                    });
                    setOpen(false);
                } else {
                    toast({
                        title: "Warning",
                        description:
                            "Transaction completed but there was an issue refreshing the data. You may need to reload the page.",
                        variant: "destructive",
                    });
                }
            } else {
                toast({
                    title: "Error",
                    description: "Failed to update profile. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (err) {
            console.error("Error submitting form:", err);
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                    <Pencil className="w-4 h-4" />
                    Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>Edit Company Profile</DialogTitle>
                    <DialogDescription>
                        Make changes and save to update your profile.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="website" className="text-right">Website</Label>
                            <Input
                                id="website"
                                value={formData.website}
                                onChange={(e) =>
                                    setFormData({ ...formData, website: e.target.value })
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="industry" className="text-right">Industry</Label>
                            <select
                                id="industry"
                                value={formData.industry}
                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                className="col-span-3 rounded-md border border-gray-300 px-3 py-2"
                            >
                                <option value="" disabled>Select an industry</option>
                                {industryOptions.map((industry) => (
                                    <option key={industry} value={industry}>
                                        {industry}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}