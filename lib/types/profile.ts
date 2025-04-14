interface UserProfile {
    id: string;
    walletAddress: string;
    username: string;
    description: string;
    avatarUrl?: string;    // Optional Profile Picture
    createdAt: Date;
    updatedAt: Date;
}

interface StudentProfile extends UserProfile {
    fieldOfStudy: string;
    academicProgression: AcademicProgression;
    portfolioURL?: string;
}

interface CompanyProfile extends UserProfile {
    websiteURL: string;
    industry: string[];
}

type AcademicProgression = "Pre-University" | "Undergraduate" | "Graduate" | "PhD";

export type { UserProfile, StudentProfile, CompanyProfile };