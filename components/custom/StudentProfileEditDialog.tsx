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
import { fieldOfStudyOptions, academicProgressionOptions } from "@/lib/types/profile";

interface StudentProfileEditDialogProps {
    open: boolean;
    setOpen: (value: boolean) => void;
    studentData: {
        name: string;
        description: string;
        academic_progression: string;
        field_of_study: string;
        portfolio_url: string;
        walletAddress: string;
        avatarURL?: string;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate: (updatedData: any) => Promise<boolean>;
}

export function StudentProfileEditDialog({
    studentData,
    onUpdate,
}: StudentProfileEditDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Separate editable and non-editable data
    const { walletAddress } = studentData;
    const [formData, setFormData] = useState({
        name: studentData.name,
        description: studentData.description,
        academic_progression: studentData.academic_progression || "",
        field_of_study: studentData.field_of_study || "",
        portfolio_url: studentData.portfolio_url || "",
        avatarURL: studentData.avatarURL,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                academicProgression: formData.academic_progression,
                fieldOfStudy: formData.field_of_study,
                portfolioURL: formData.portfolio_url,
                walletAddress,
                avatarURL: formData.avatarURL,
            };

            const res = await fetch("/api/editStudentProfile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const updateSuccess = await onUpdate({
                    name: formData.name,
                    description: formData.description,
                    academic_progression: formData.academic_progression,
                    field_of_study: formData.field_of_study,
                    portfolio_url: formData.portfolio_url,
                    walletAddress,
                    avatarURL: formData.avatarURL,
                });
                if (updateSuccess) {
                    toast({
                        title: "Success",
                        description: "Student profile updated successfully!",
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
                    <DialogTitle>Edit Student Profile</DialogTitle>
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
                            <Label htmlFor="description" className="text-right">Bio</Label>
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
                            <Label htmlFor="academic_progression" className="text-right">Academic Level</Label>
                            <select
                                id="academic_progression"
                                value={formData.academic_progression}
                                onChange={(e) => setFormData({ ...formData, academic_progression: e.target.value })}
                                className="col-span-3 rounded-md border border-gray-300 px-3 py-2"
                            >
                                <option value="" disabled>Select academic level</option>
                                {academicProgressionOptions.map((level) => (
                                    <option key={level} value={level}>
                                        {level}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="field_of_study" className="text-right">Field of Study</Label>
                            <select
                                id="field_of_study"
                                value={formData.field_of_study}
                                onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                                className="col-span-3 rounded-md border border-gray-300 px-3 py-2"
                            >
                                <option value="" disabled>Select field of study</option>
                                {fieldOfStudyOptions.map((field) => (
                                    <option key={field} value={field}>
                                        {field}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="portfolio_url" className="text-right">Portfolio URL</Label>
                            <Input
                                id="portfolio_url"
                                value={formData.portfolio_url}
                                onChange={(e) =>
                                    setFormData({ ...formData, portfolio_url: e.target.value })
                                }
                                className="col-span-3"
                            />
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