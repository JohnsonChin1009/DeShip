"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FileInput } from '@/components/ui/file-input';
import { MilestoneInput, type Milestone } from '@/components/ui/milestone-input';
import { Sidebar } from '@/components/custom/sidebar';
import { Header } from '@/components/custom/header';


// form schema for the validation (might need to change ltr)
const formSchema = z.object({
  title: z.string().min(3, { message: "Scholarship name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  eligibility: z.object({
    gpa: z.coerce.number().min(0, { message: "GPA must be at least 0" }).max(4, { message: "GPA must be at most 4" }),
    additionalRequirements: z.string().optional(),
  }),
  amount: z.coerce.number().min(1, { message: "Amount must be at least 1" }),
  deadline: z.string().min(1, { message: "Deadline is required" }),
  milestones: z.array(
    z.object({
      title: z.string().min(1, { message: "Milestone title is required" }),
      amount: z.coerce.number().min(1, { message: "Amount must be at least 1" }),
    })
  ),
  termsFile: z
    .any()
    .refine(
      (files) => typeof window !== "undefined" && files instanceof FileList && files.length > 0,
      { message: "Terms & Conditions file is required" }
    ),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateScholarshipPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Mock company data
  const company = {
    name: "TechCorp",
    logo: "/images/techcorp-logo.png",
    industry: "Technology",
  };

  //using zod validation ( intiial state of the form)
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
      milestones: [],
      termsFile: undefined,
    },
  });

  const onSubmit = async (data: FormValues) => {
    console.log("Form submitted:", data);
    // Here you would typically send the data to your API
    // For now, we'll just simulate a successful submission
    alert("Scholarship created successfully!");
    router.push("/company/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar company={company} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <main className={`${sidebarOpen ? 'ml-64' : 'ml-0'} min-h-screen bg-background transition-all`}>
        {/* Header */}
        <Header 
          title="Create Scholarship" 
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        {/* Form Content */}
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Scholarship Details</CardTitle>
              <CardDescription>
                Create a new scholarship program for students. Fill in all the required information below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scholarship Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Future Tech Leaders Scholarship" {...field} />
                          </FormControl>
                          <FormDescription>
                            The name of your scholarship program.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the purpose and goals of this scholarship..." 
                              className="min-h-32"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Provide a detailed description of the scholarship program.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Eligibility Criteria */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Eligibility Criteria</h3>
                    
                    <FormField
                      control={form.control}
                      name="eligibility.gpa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum GPA</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" min="0" max="4" {...field} />
                          </FormControl>
                          <FormDescription>
                            The minimum GPA required for applicants (0-4 scale).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="eligibility.additionalRequirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Requirements (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any additional eligibility requirements..." 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Any additional requirements or qualifications for applicants.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Funding Details */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Funding Details</h3>
                    
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Amount (in cryptocurrency)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormDescription>
                            The total amount of funding for this scholarship.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application Deadline</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>
                            The deadline for applications.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="milestones"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Milestones</FormLabel>
                          <FormControl>
                            <MilestoneInput 
                              value={field.value as Milestone[]} 
                              onChange={field.onChange} 
                            />
                          </FormControl>
                          <FormDescription>
                            Define payment milestones for the scholarship (e.g., semester-wise payments).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="termsFile"
                      render={({ field: { onChange, ...fieldProps } }) => (
                        <FormItem>
                          <FormLabel>Terms & Conditions</FormLabel>
                          <FormControl>
                            <FileInput
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => onChange(e.target.files)}
                              {...fieldProps}
                            />
                          </FormControl>
                          <FormDescription>
                            Upload a document with the terms and conditions for this scholarship.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4">
                    <Button variant="outline" type="button" asChild>
                      <Link href="/company/dashboard">Cancel</Link>
                    </Button>
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
