"use client";

import React, { useState, useEffect } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ethers } from 'ethers';
import { scholarshipFactory_CA, scholarshipFactory_ABI } from "@/lib/contractABI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FileInput } from '@/components/ui/file-input';
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
    percent1: z.coerce.number()
      .min(1, { message: "Percentage must be at least 1%" })
      .max(98, { message: "Percentage must be at most 98%" }),
    title2: z.string().min(1, { message: "Milestone 2 title is required" }),
    percent2: z.coerce.number()
      .min(1, { message: "Percentage must be at least 1%" })
      .max(98, { message: "Percentage must be at most 98%" }),
    title3: z.string().min(1, { message: "Milestone 3 title is required" }),
    percent3: z.coerce.number()
      .min(1, { message: "Percentage must be at least 1%" })
      .max(98, { message: "Percentage must be at most 98%" }),
  }),
  termsFile: z
    .any()
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ScholarshipCreateDialogProps {
  buttonText?: string;
  onSuccess?: () => Promise<boolean | void>;
}

export function ScholarshipCreateDialog({
  buttonText = "Create Scholarship",
  onSuccess
}: ScholarshipCreateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const [percentageTotal, setPercentageTotal] = useState(0);
  const [milestoneAmounts, setMilestoneAmounts] = useState([0, 0, 0]);

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
        percent1: 33,
        title2: "",
        percent2: 33,
        title3: "",
        percent3: 34,
      },
      termsFile: undefined,
    },
  });

  const totalAmount = form.watch("amount");
  const percent1 = form.watch("milestones.percent1");
  const percent2 = form.watch("milestones.percent2");
  const percent3 = form.watch("milestones.percent3");

  useEffect(() => {
    const p1 = parseInt(String(percent1 || 0));
    const p2 = parseInt(String(percent2 || 0));
    const p3 = parseInt(String(percent3 || 0));
    
    // Calculate total percentage
    const total = p1 + p2 + p3;
    setPercentageTotal(total);

    if (totalAmount > 0) {
      const amount1 = (p1 / 100) * totalAmount;
      const amount2 = (p2 / 100) * totalAmount;
      
      const amount3 = totalAmount - amount1 - amount2;
      
      setMilestoneAmounts([
        amount1, 
        amount2, 
        amount3
      ]);
    }
  }, [totalAmount, percent1, percent2, percent3]);

  const onSubmit = async (data: FormValues) => {
    if (percentageTotal !== 100) {
      toast({
        title: "Validation Error",
        description: `Milestone percentages must add up to 100%. Current total: ${percentageTotal}%`,
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      if (typeof window.ethereum === "undefined") {
        toast({
          title: "Error",
          description: "Please install MetaMask to use this feature.",
          variant: "destructive",
        });
        return;
      }

      const totalAmountWei = BigInt(Math.round(data.amount * 1e18)).toString();
      
      const milestoneWeiAmounts = milestoneAmounts.map(amount => 
        BigInt(Math.round(amount * 1e18)).toString()
      );

      const milestoneTitles = [
        data.milestones.title1,
        data.milestones.title2,
        data.milestones.title3,
      ];

      const gpa = Math.round(data.eligibility.gpa * 100);

      const deadlineTimestamp = Math.floor(new Date(data.deadline).getTime() / 1000);

      const additionalRequirements = data.eligibility.additionalRequirements || "";

      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(scholarshipFactory_CA, scholarshipFactory_ABI, signer);

      const tx = await contract.createScholarship(
        data.title,
        data.description,
        gpa,
        additionalRequirements,
        totalAmountWei,
        deadlineTimestamp,
        milestoneTitles,
        milestoneWeiAmounts,
        {
          value: BigInt(Math.round(data.amount * 1e18)),
        }
      );

      const receipt = await tx.wait();

      // Get the scholarship contract address from the event logs
      const event = receipt.logs.find(
        (log: { fragment?: { name: string } }) => log.fragment && log.fragment.name === "ScholarshipCreated"
      );
      const scholarshipAddress = event ? event.args[0] : null;

      setIsOpen(false);
      
      if (onSuccess) {
        await onSuccess();
      } else {
        window.location.reload();
      }
      
      toast({
        title: 'Success',
        description: (
          <div className="flex flex-col gap-2">
            <p>Scholarship created successfully!</p>
            {scholarshipAddress && (
              <a
                href={`https://sepolia.scrollscan.com/address/${scholarshipAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 underline text-sm"
              >
                View on Explorer: {scholarshipAddress}
              </a>
            )}
          </div>
        ),
        variant: 'default',
        className: 'border-l-4 border-green-500 top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4',
      });
      
      // Reset form
      form.reset();

    } catch (err) {
      console.error("Submission error:", err);
      toast({
        title: "Error",
        description: "Failed to create scholarship. Please check your wallet and network.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isCreating || !open) {
        setIsOpen(open);
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4"/>
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Scholarship</DialogTitle>
          <DialogDescription>
            Create a new scholarship program for students. Fill in all the required information below.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scholarship Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Future Tech Leaders Scholarship"
                        {...field}
                      />
                    </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Eligibility Criteria
              </h3>

              <FormField
                control={form.control}
                name="eligibility.gpa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum GPA</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="4"
                        {...field}
                      />
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
                    <FormLabel>
                      Additional Requirements (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional eligibility requirements..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Funding Details</h3>

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Total Amount (ETH)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="0.00001" {...field} />
                    </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Milestones</h3>
                <span className={`text-sm font-medium ${percentageTotal === 100 ? 'text-green-600' : 'text-red-600'}`}>
                  Total: {percentageTotal}% {percentageTotal === 100 ? '✓' : '(must be 100%)'}
                </span>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                <FormField
                  control={form.control}
                  name="milestones.title1"
                  render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-3">
                      <FormLabel>Milestone 1 Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Application"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="milestones.percent1"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-1">
                      <FormLabel>Percent</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min="1"
                          max="98"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-2 md:col-span-2">
                  <FormLabel>Amount (ETH)</FormLabel>
                  <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background">
                    {totalAmount > 0 ? milestoneAmounts[0].toFixed(6) : '0.000000'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                <FormField
                  control={form.control}
                  name="milestones.title2"
                  render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-3">
                      <FormLabel>Milestone 2 Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Interview"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="milestones.percent2"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-1">
                      <FormLabel>Percent</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min="1"
                          max="98"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-2 md:col-span-2">
                  <FormLabel>Amount (ETH)</FormLabel>
                  <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background">
                    {totalAmount > 0 ? milestoneAmounts[1].toFixed(6) : '0.000000'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                <FormField
                  control={form.control}
                  name="milestones.title3"
                  render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-3">
                      <FormLabel>Milestone 3 Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Award Disbursement"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="milestones.percent3"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-1">
                      <FormLabel>Percent</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min="1"
                          max="98"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-2 md:col-span-2">
                  <FormLabel>Amount (ETH)</FormLabel>
                  <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background">
                    {totalAmount > 0 ? milestoneAmounts[2].toFixed(6) : '0.000000'}
                  </div>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="termsFile"
              render={({ field: { onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Terms & Conditions (Optional)</FormLabel>
                  <FormControl>
                    <FileInput
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => onChange(e.target.files)}
                      {...fieldProps}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a document with the terms and conditions for
                    this scholarship.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)} type="button">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || percentageTotal !== 100}
              >
                {isCreating ? "Creating..." : "Create Scholarship"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 