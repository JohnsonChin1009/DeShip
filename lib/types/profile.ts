interface UserProfile {
    walletAddress: string; // Primary Key for each user
    username: string;
    description: string;
    avatarUrl?: string;    // Optional Profile Picture
    createdAt: Date;
    updatedAt: Date;
}

interface StudentProfile extends UserProfile {
    fieldOfStudy: FieldOfStudy;
    academicProgression: AcademicProgression;
    portfolioURL?: string;
}

interface CompanyProfile extends UserProfile {
    websiteURL: string;
    industry: Industry[];
}

export const fieldOfStudyOptions: FieldOfStudy[] = [
    "Computer Science",
    "Mechanical Engineering",
    "Psychology",
    "Business Administration",
    "Environmental Studies",
    "Fine Arts",
    "Biotechnology",
    "Economics",
    "Education",
    "Political Science",
];

export const industryOptions: Industry[] = [
    "Information Technology",
    "Healthcare",
    "Education",
    "Finance",
    "Energy Generation",
    "Manufacturing",
    "Media & Entertainment",
    "Biotech & Pharmaceuticals",
    "Retail & E-commerce",
    "Consulting and Training",
]

export const academicProgressionOptions: AcademicProgression[] = [
    "Pre-University",
    "Undergraduate",
    "Graduate",
    "PhD",
];

type Industry = "Information Technology" | "Healthcare" | "Education" | "Finance" | "Energy Generation" | "Manufacturing" | "Media & Entertainment" | "Biotech & Pharmaceuticals" | "Retail & E-commerce" | "Consulting and Training";

type FieldOfStudy = "Computer Science" | "Mechanical Engineering" | "Psychology" | "Business Administration" | "Environmental Studies" | "Fine Arts" | "Biotechnology" | "Economics" | "Education" | "Political Science";

type AcademicProgression = "Pre-University" | "Undergraduate" | "Graduate" | "PhD";

export type { UserProfile, StudentProfile, CompanyProfile, AcademicProgression };