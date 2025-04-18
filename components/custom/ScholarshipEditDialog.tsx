"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";

//to solve eslint error when using contract ABI prop (john)
interface ScholarshipContractABI {
  inputs?: Array<{
    internalType?: string;
    name: string;
    type: string;
    indexed?: boolean;
    components?: Array<{
      internalType?: string;
      name: string;
      type: string;
    }>;
  }>;
  outputs?: Array<{
    internalType?: string;
    name: string;
    type: string;
    components?: Array<{
      internalType?: string;
      name: string;
      type: string;
    }>;
  }>;
  name?: string;
  type: string;
  stateMutability?: string;
  anonymous?: boolean;
}

interface ScholarshipEditDialogProps {
  scholarshipAddress: string;
  scholarshipData: {
    title: string;
    description: string;
    gpa: number;
    additionalRequirements: string;
    deadline: Date;
  };
  contractABI: ScholarshipContractABI[];
  onUpdate: () => Promise<boolean | void>;
}


export function ScholarshipEditDialog({
  scholarshipAddress,
  scholarshipData,
  contractABI,
  onUpdate
}: ScholarshipEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    gpa: '',
    additionalRequirements: '',
    deadline: ''
  });

  // Initialize form data when scholarship data changes
  useEffect(() => {
    if (scholarshipData) {
      setFormData({
        title: scholarshipData.title,
        description: scholarshipData.description,
        gpa: scholarshipData.gpa.toString(),
        additionalRequirements: scholarshipData.additionalRequirements,
        deadline: formatDateForInput(scholarshipData.deadline)
      });
    }
  }, [scholarshipData]);

  // Format date for the date input (without time)
  const formatDateForInput = (date: Date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  // Handle input changes in the edit form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update scholarship details
  const handleUpdateScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        // Connect to the Scholarship contract with signer
        const scholarshipContract = new ethers.Contract(
          scholarshipAddress,
          contractABI,
          signer
        );
        
        // Convert GPA to contract format (multiply by 100 to store as integer)
        const gpaForContract = Math.round(parseFloat(formData.gpa) * 100);
        
        // Convert deadline to unix timestamp (set time to end of day)
        const deadlineDate = new Date(formData.deadline);
        deadlineDate.setHours(23, 59, 59);
        const deadlineTimestamp = Math.floor(deadlineDate.getTime() / 1000);
        
        // Call the updateScholarshipDetails function
        const tx = await scholarshipContract.updateScholarshipDetails(
          formData.title,
          formData.description,
          gpaForContract,
          formData.additionalRequirements,
          deadlineTimestamp
        );
        
        // Wait for transaction to be mined
        await tx.wait();
        
        setIsOpen(false);
        
        // Refresh scholarship details
        const updateSuccess = await onUpdate();
        
        toast({
          title: updateSuccess ? 'Success' : 'Warning',
          description: updateSuccess 
            ? 'Scholarship details updated successfully!' 
            : 'Transaction completed but there was an issue refreshing the data. You may need to reload the page.',
          variant: updateSuccess ? 'default' : 'destructive',
          className: updateSuccess ? 'border-l-4 border-green-500' : '',
        });
      }
    } catch (error) {
      console.error("Error updating scholarship details:", error);
      toast({
        title: "Error",
        description: "Failed to update scholarship details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isUpdating || !open) {
        setIsOpen(open);
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" type="button">
          <Pencil className="w-4 h-4 mr-1" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Scholarship</DialogTitle>
          <DialogDescription>
            Update the details of your scholarship. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="gpa">Minimum GPA</Label>
              <Input
                id="gpa"
                name="gpa"
                type="number"
                min="0"
                max="4.0"
                step="0.1"
                value={formData.gpa}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deadline">Application Deadline</Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="additionalRequirements">Additional Requirements</Label>
            <Textarea
              id="additionalRequirements"
              name="additionalRequirements"
              value={formData.additionalRequirements}
              onChange={handleInputChange}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} type="button">
            Cancel
          </Button>
          <Button 
            onClick={(e) => {
              e.preventDefault();
              handleUpdateScholarship(e);
            }} 
            disabled={isUpdating}
            type="button"
          >
            {isUpdating ? "Updating..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 