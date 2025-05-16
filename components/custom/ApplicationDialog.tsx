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
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";

export default function ApplicationDialog() {
    const { user } = useUser();
    const { toast } = useToast();
    const [cgpa, setCgpa] = useState("");
    const [income, setIncome] = useState("");
    const [statement, setStatement] = useState("");

    const handleSubmitApplication = async () => {
  const numericCgpa = parseFloat(cgpa);
  const numericIncome = parseFloat(income);

  if (numericCgpa > 4.0 || numericCgpa < 0) {
    toast({
      variant: "destructive",
      title: "Invalid CGPA",
      description: "CGPA must be between 0.00 and 4.00.",
    });
    return;
  }

  if (statement.length > 280) {
    toast({
      variant: "destructive",
      title: "Personal Statement Too Long",
      description: "Personal statement must be 280 characters or less.",
    });
    return;
  }

  const fieldOfStudy = user?.field_of_study || "";
  console.log("Field of Study:", fieldOfStudy);
  const industry = "Information Technology"; // Assuming this exists on user context

  try {
    const response = await fetch("/api/formatApplication", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cgpa: numericCgpa,
        income: numericIncome,
        statement,
        fieldOfStudy,
        industry,
      }),
    });

    const result = await response.json();
    console.log("API response:", result);

    toast({
      title: "Application Submitted",
      description: "Your scholarship application has been submitted successfully.",
    });
  } catch (error) {
    console.error("Failed to submit application:", error);
    toast({
      variant: "destructive",
      title: "Submission Failed",
      description: "There was an error submitting your application. Please try again later.",
    });
  }
};

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"outline"}>
                    Apply Now
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Apply Now!</DialogTitle>
                    <DialogDescription>
                        Submit an application for this scholarship.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="w-full">
                    <Label
                      htmlFor="cgpa"
                      className={`text-right ${
                        parseFloat(cgpa) > 4.0 || parseFloat(cgpa) < 0 ? "text-red-500" : ""
                      }`}
                    >
                      CGPA Scoring
                    </Label>
                    <Input
                      id="cgpa"
                      type="number"
                      step="0.01"
                      max="4.0"
                      min="0"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      placeholder="4.0"
                      className={`col-span-3 ${
                        parseFloat(cgpa) > 4.0 || parseFloat(cgpa) < 0
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                    />
                    {(parseFloat(cgpa) > 4.0 || parseFloat(cgpa) < 0) && (
                      <div className="text-sm text-red-500 mt-1 text-right">
                        CGPA must be between 0.00 and 4.00
                      </div>
                    )}
                  </div>

                    <div className="w-full">
                        <Label htmlFor="income" className="text-right">
                            Household Income
                        </Label>
                        <Input
                            id="income"
                            type="number"
                            value={income}
                            onChange={(e) => setIncome(e.target.value)}
                            placeholder="30000"
                            className="col-span-3"
                        />
                    </div>

                <div className="w-full">
                  <Label
                    htmlFor="statement"
                    className={`text-right ${statement.length > 280 ? "text-red-500" : ""}`}
                  >
                    Tell us why?
                  </Label>
                  <Textarea
                    id="statement"
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                    maxLength={500} // Can allow typing over 280 if you want validation to handle it
                    placeholder="I am dedicated to use this scholarship for... (max 280 characters)"
                    className={`w-full ${
                      statement.length > 280
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                  <div
                    className={`text-right text-sm mt-1 ${
                      statement.length > 280 ? "text-red-500" : "text-muted-foreground"
                    }`}
                  >
                    {statement.length}/280 characters
                  </div>
                </div>
                </div>

                <DialogFooter>
                    <Button type="submit" onClick={handleSubmitApplication}>
                        Submit Application
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}