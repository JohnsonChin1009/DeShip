"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ethers } from 'ethers';
import { scholarshipFactory_CA, scholarshipFactory_ABI } from "@/lib/contractABI";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FileInput } from '@/components/ui/file-input';
import { Sidebar } from '@/components/custom/sidebar';
import { Header } from '@/components/custom/header';

const formSchema = z.object({
  title: z.string().min(3, { message: "Scholarship name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  eligibility: z.object({
    gpa: z.coerce.number().min(0, { message: "GPA must be at least 0" }).max(4, { message: "GPA must be at most 4" }),
    additionalRequirements: z.string().optional(),
  }),
  amount: z.coerce.number().min(0.00001, { message: "Amount must be at least 0.00001" }),
  deadline: z.string().min(1, { message: "Deadline is required" }),
  milestones: z.object({
    title1: z.string().min(1, { message: "Milestone 1 title is required" }),
    amount1: z.coerce.number().min(0.000001, { message: "Milestone 1 amount must be at least 0.000001" }),
    title2: z.string().min(1, { message: "Milestone 2 title is required" }),
    amount2: z.coerce.number().min(0.000001, { message: "Milestone 2 amount must be at least 0.000001" }),
    title3: z.string().min(1, { message: "Milestone 3 title is required" }),
    amount3: z.coerce.number().min(0.000001, { message: "Milestone 3 amount must be at least 0.000001" }),
  }),
  termsFile: z
    .any()
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateScholarshipPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const company = {
    name: "TechCorp",
    logo: "/images/techcorp-logo.png",
    industry: "Technology",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      eligibility: {
        gpa: 3.0,
        additionalRequirements: "",
      },
      amount: 0,
      deadline: "",
      milestones: {
        title1: "",
        amount1: 0,
        title2: "",
        amount2: 0,
        title3: "",
        amount3: 0,
      },
      termsFile: undefined,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Helper function to convert decimal numbers to integers (multiply by 10)
      const convertToInteger = (value: number) => Math.round(value * 10);

      // Check for MetaMask availability
      if (typeof window.ethereum === "undefined") {
        alert("Please install MetaMask to use this feature.");
        return;
      }

      // Convert totalAmount and milestone amounts to Wei (in Wei, using the multiplied integer values)
      const totalAmountWei = (data.amount * 1e18).toString();  // Convert to Wei
      const milestoneAmounts = [
        (Math.round(data.milestones.amount1 * 1e18)).toString(),
        (Math.round(data.milestones.amount2 * 1e18)).toString(),
        (Math.round(data.milestones.amount3 * 1e18)).toString(),
      ];

      // Convert GPA to an integer (multiplied by 10)
      const gpa = convertToInteger(data.eligibility.gpa);

      // Convert deadline to Unix timestamp (already passed as string or number, but making sure)
      const deadlineTimestamp = Math.floor(new Date(data.deadline).getTime() / 1000);

      // Ensure all titles for milestones are properly set
      const milestoneTitles = [
        data.milestones.title1,
        data.milestones.title2,
        data.milestones.title3,
      ];

      // Handle additionalRequirements (if optional, ensure empty string is passed)
      const additionalRequirements = data.eligibility.additionalRequirements || "";

      // Set up provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await provider.getSigner();

      // Initialize the contract
      const contract = new ethers.Contract(scholarshipFactory_CA, scholarshipFactory_ABI, signer);

      // Call createScholarship method with correct data formatting
      const tx = await contract.createScholarship(
        data.title,
        data.description,
        gpa,
        additionalRequirements,
        totalAmountWei,
        deadlineTimestamp,
        milestoneTitles,
        milestoneAmounts,
        {
          value: BigInt(totalAmountWei),
        }
      );

      console.log("Transaction sent:", tx);

      alert("Scholarship created successfully!");
      router.push("/company/dashboard");

    } catch (err) {
      console.error("Submission error:", err);
      alert("Something went wrong while creating the scholarship. Please check your wallet and network.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar company={company} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className={`${sidebarOpen ? 'ml-64' : 'ml-0'} min-h-screen bg-background transition-all`}>
        <Header title="Create Scholarship" sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Scholarship Details</CardTitle>
              <CardDescription>Create a new scholarship program for students. Fill in all the required information below.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Basic Information</h3>

                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scholarship Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Future Tech Leaders Scholarship" {...field} /></FormControl>
                        <FormDescription>The name of your scholarship program.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea placeholder="Describe the purpose and goals of this scholarship..." className="min-h-32" {...field} /></FormControl>
                        <FormDescription>Provide a detailed description of the scholarship program.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Eligibility Criteria</h3>

                    <FormField control={form.control} name="eligibility.gpa" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum GPA</FormLabel>
                        <FormControl><Input type="number" step="0.1" min="0" max="4" {...field} /></FormControl>
                        <FormDescription>The minimum GPA required for applicants (0-4 scale).</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="eligibility.additionalRequirements" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Requirements (Optional)</FormLabel>
                        <FormControl><Textarea placeholder="Any additional eligibility requirements..." {...field} /></FormControl>
                        <FormDescription>Any additional requirements or qualifications for applicants.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Funding Details</h3>

                    <FormField control={form.control} name="amount" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount (in cryptocurrency)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormDescription>The total amount of funding for this scholarship.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="deadline" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application Deadline</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormDescription>The deadline for applications.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">Milestones</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="milestones.title1" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Milestone 1 Title</FormLabel>
                            <FormControl><Input placeholder="e.g., Application" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="milestones.amount1" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Milestone 1 Amount (ETH)</FormLabel>
                            <FormControl><Input type="number" step="0.00001" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="milestones.title2" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Milestone 2 Title</FormLabel>
                            <FormControl><Input placeholder="e.g., Interview" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="milestones.amount2" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Milestone 2 Amount (ETH)</FormLabel>
                            <FormControl><Input type="number" step="0.00001" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="milestones.title3" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Milestone 3 Title</FormLabel>
                            <FormControl><Input placeholder="e.g., Award Disbursement" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="milestones.amount3" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Milestone 3 Amount (ETH)</FormLabel>
                            <FormControl><Input type="number" step="0.00001" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    <FormField control={form.control} name="termsFile" render={({ field: { onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Terms & Conditions</FormLabel>
                        <FormControl><FileInput accept=".pdf,.doc,.docx" onChange={(e) => onChange(e.target.files)} {...fieldProps} /></FormControl>
                        <FormDescription>Upload a document with the terms and conditions for this scholarship.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button variant="outline" type="button" asChild><Link href="/company/dashboard">Cancel</Link></Button>
                    <Button type="submit">Create Scholarship</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
