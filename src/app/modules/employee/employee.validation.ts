import z from "zod";

const updateEmployeeSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Employee name is required")
        .optional(),
    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Email must be valid")
        .optional(),
    serviceCategoryId: z
        .string()
        .trim()
        .min(1, "Service category is required")
        .optional(),
    profilePhoto: z
        .string()
        .trim()
        .min(1, "Profile photo is required")
        .url("Profile photo must be a valid URL")
        .optional(),
    bio: z
        .string()
        .trim()
        .min(1, "Bio is required")
        .optional(),
    address: z
        .string()
        .trim()
        .min(1, "Address is required")
        .optional(),
    phone: z
        .string()
        .trim()
        .min(1, "Phone is required")
        .max(20, "Phone must be at most 20 characters")
        .optional(),
    hourlyRate: z.coerce
        .number()
        .positive("Hourly rate must be greater than 0")
        .optional(),
    experienceYears: z.coerce
        .number()
        .int("Experience years must be a whole number")
        .min(0, "Experience years cannot be negative")
        .optional(),
    isActive: z.boolean().optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field is required to update"
    }
);

const updateMyProfileSchema = z.object({
    profilePhoto: z
        .string()
        .trim()
        .min(1, "Profile photo is required")
        .url("Profile photo must be a valid URL")
        .optional(),
    bio: z
        .string()
        .trim()
        .min(1, "Bio is required")
        .optional(),
    address: z
        .string()
        .trim()
        .min(1, "Address is required")
        .optional(),
    phone: z
        .string()
        .trim()
        .min(1, "Phone is required")
        .max(20, "Phone must be at most 20 characters")
        .optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field is required to update"
    }
);

export type TUpdateEmployeePayload = z.infer<typeof updateEmployeeSchema>;
export type TUpdateMyProfilePayload = z.infer<typeof updateMyProfileSchema>;

export const employeeValidationSchemas = {
    updateEmployeeSchema,
    updateMyProfileSchema
};
