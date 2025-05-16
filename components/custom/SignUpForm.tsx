"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fieldOfStudyOptions, industryOptions, academicProgressionOptions } from "@/lib/types/profile";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

interface SignUpFormProps {
  role: string;
  walletAddress?: string;
}

type StudentFormValues = {
  walletAddress: string;
  username: string;
  bio: string;
  profileImage?: File;
  fieldOfStudy: string;
  academicProgression: string;
  portfolioURL?: string;
};


type CompanyFormValues = {
  walletAddress: string;
  username: string;
  bio: string;
  profileImage?: File;
  websiteURL: string;
  industry: string[];
};

export default function SignUpForm({ role, walletAddress }: SignUpFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  // Access the UserContext to update user data directly
  const { setUser } = useUser();

  const studentFormSchema = z.object({
    walletAddress: z.string().min(1, "Wallet address is required"),
    username: z.string().min(1, "Username is required").min(3, "Username must be at least 3 characters"),
    bio: z.string().min(1, "Bio is required").min(10, "Bio must be at least 10 characters"),
    profileImage: z.instanceof(File).optional(),
    fieldOfStudy: z.enum(fieldOfStudyOptions as [string, ...string[]], {required_error: "Please select a field of study"}),
    academicProgression: z.enum(academicProgressionOptions as [string, ...string[]], {required_error: "Please select your academic progression"}),
    portfolioURL: z.string().url("Invalid URL").optional(),
  });

  const companyFormSchema = z.object({
    walletAddress: z.string().min(1, "Wallet address is required"),
    username: z.string().min(1, "Username is required"),
    bio: z.string().min(1, "Bio is required"),
    profileImage: z.instanceof(File).optional(),
    websiteURL: z.string().url("Invalid URL").min(1, "Website URL is required"),
    industry: z.array(z.enum(industryOptions as [string, ...string[]])).min(1, "At least one industry is required"),
  });

  const studentForm = useForm<z.infer<typeof studentFormSchema>>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      walletAddress: walletAddress || "",
      username: "",
      bio: "",
      profileImage: undefined,
      fieldOfStudy: undefined,
      academicProgression: undefined,
      portfolioURL: "",
    },
  });

  const companyForm = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      walletAddress: walletAddress || "",
      username: "",
      bio: "",
      profileImage: undefined,
      websiteURL: "",
      industry: [],
    },
  });

  async function onSubmit(
    values: StudentFormValues | CompanyFormValues
  ) {
    const result = await fetch("/api/createUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({...values, role}),
    });
    
    if (!result.ok) {
      const errorData = await result.json();
      toast({title: "Uh Oh! Something went wrong!", description: errorData.message})
      return;
    }

    const responseData = await result.json();
    
    // Store data in localStorage before redirecting
    localStorage.setItem("userRole", role);
    localStorage.setItem("walletAddress", walletAddress || "");
    
    const userData = {
      username: values.username,
      bio: values.bio,
      txHash: responseData.txHash
    };
    localStorage.setItem("userData", JSON.stringify(userData));

    // Create user profile object to update UserContext directly
    const userProfile = {
      wallet_address: walletAddress || "",
      username: values.username,
      description: values.bio,
      role: role as "Student" | "Company",
      // Add role-specific fields using type guards
      ...(role === "Student" && 'fieldOfStudy' in values ? {
        field_of_study: values.fieldOfStudy,
        academic_progression: values.academicProgression,
        portfolio_url: values.portfolioURL,
      } : role === "Company" && 'websiteURL' in values ? {
        website_url: values.websiteURL,
        industry: values.industry,
      } : {}),
    };
    
    // Update UserContext directly with the new user data
    setUser(userProfile);

    // Cache this data in sessionStorage
    if (typeof window !== 'undefined') {
      const cacheKey = `${walletAddress}-${role}`;
      sessionStorage.setItem(cacheKey, JSON.stringify(userProfile));
    }

    toast({title: "User Profile Created Succesfully!", description: "Redirecting you to the dashboard..."})

    router.push("/dashboard");
  }

  return (
    <>
      {role === "Student" && (
        <Form {...studentForm}>
          <form
            onSubmit={studentForm.handleSubmit(onSubmit as any)}
            className="text-left space-y-6"
          >
            <FormField
              control={studentForm.control}
              name="walletAddress"
              render={({ field }) => (
                <FormItem className="form-item-spacing">
                  <FormLabel className="sign-up-label">
                    WALLET ADDRESS
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={walletAddress} {...field} disabled />
                  </FormControl>
                </FormItem>
              )}
            ></FormField>

            <FormField
              control={studentForm.control}
              name="username"
              render={({ field }) => (
                <FormItem className="form-item-spacing">
                  <FormLabel className="sign-up-label">USERNAME <span className="italic">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Vitalik Buterin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>

            <FormField
              control={studentForm.control}
              name="bio"
              render={({ field }) => (
                <FormItem className="form-item-spacing">
                  <FormLabel className="sign-up-label">BIO <span className="italic">*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      className="bg-white"
                      placeholder="Tell us a bit about yourself..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>

            <FormField
              control={studentForm.control}
              name="fieldOfStudy"
              render={({ field }) => (
                <FormItem className="form-item-spacing">
                  <FormLabel className="sign-up-label">
                    FIELD OF STUDY <span className="italic">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pick here!" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fieldOfStudyOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>

            <FormField
              control={studentForm.control}
              name="academicProgression"
              render={({ field }) => (
                <FormItem className="form-item-spacing">
                  <FormLabel className="sign-up-label">
                    ACADEMIC PROGRESSION <span className="italic">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pick here!" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {academicProgressionOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>

            <FormField
              control={studentForm.control}
              name="portfolioURL"
              render={({ field }) => (
                <FormItem className="form-item-spacing">
                  <FormLabel className="sign-up-label">PORTFOLIO URL <span className="text-sm italic font-normal">(optional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="https://deship.vercel.app" {...field} />
                  </FormControl>
                </FormItem>
              )}
            ></FormField>

            <Button className="font-bold text-[16px] w-full py-6" type="submit">
              SUBMIT
            </Button>
          </form>
        </Form>
      )}

      {role == "Company" && (
        <Form {...companyForm}>
          <form
            onSubmit={companyForm.handleSubmit(onSubmit as any)}
            className="text-left space-y-6"
          >
            <FormField
              control={companyForm.control}
              name="walletAddress"
              render={({ field }) => (
                <FormItem className="form-item-spacing">
                  <FormLabel className="sign-up-label">
                    WALLET ADDRESS
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={walletAddress} {...field} disabled />
                  </FormControl>
                </FormItem>
              )}
            ></FormField>

            <FormField
              control={companyForm.control}
              name="username"
              render={({ field }) => (
                <FormItem className="form-item-spacing">
                  <FormLabel className="sign-up-label">COMPANY NAME <span className="italic">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="XYZ Labs" {...field} />
                  </FormControl>
                </FormItem>
              )}
            ></FormField>

            <FormField
              control={companyForm.control}
              name="bio"
              render={({ field }) => (
                <FormItem className="form-item-spacing">
                  <FormLabel className="sign-up-label">COMPANY BIO <span className="italic">*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      className="bg-white"
                      placeholder="We're a company focusing on rugpull and pumpDump projects..."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            ></FormField>

            <FormField
              control={companyForm.control}
              name="websiteURL"
              render={({ field }) => (
                <FormItem className="form-item-spacing">
                  <FormLabel className="sign-up-label">
                    COMPANY WEBSITE URL <span className="italic">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://xyzlabs.com" {...field} />
                  </FormControl>
                </FormItem>
              )}
            ></FormField>

            <FormField
              control={companyForm.control}
              name="industry"
              render={({ field }) => (
                <FormItem className="form-item-spacing">
                  <FormLabel className="sign-up-label">RELATED INDUSTRIES <span className="italic">*</span></FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {industryOptions.map((option) => {
                      const isSelected = field.value?.includes(option);

                      return (
                        <div
                          key={option}
                          onClick={() => {
                            const newValue = isSelected
                              ? field.value.filter((val) => val !== option)
                              : [...(field.value || []), option];

                            field.onChange(newValue);
                          }}
                          className={`
                            cursor-pointer border rounded-lg px-5 py-3 text-sm font-medium
                            ${isSelected ? "bg-[#626262] text-white duration-200s shadow-md3 font-bold" : "bg-white shadow-md text-gray-800 hover:font-bold duration-200"}
                          `}
                        >
                          {option}
                        </div>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="font-bold text-[16px] w-full py-6" type="submit">SUBMIT</Button>
          </form>
        </Form>
      )}
    </>
  );
}
