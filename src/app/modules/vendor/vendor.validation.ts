import z from "zod";

const updateMyVendorSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Name is required")
        .optional(),
    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Email must be valid")
        .optional(),
    vendorName: z
        .string()
        .trim()
        .min(1, "Vendor name is required")
        .optional(),
    logo: z
        .string()
        .trim()
        .min(1, "Logo is required")
        .optional(),
    phone: z
        .string()
        .trim()
        .min(1, "Phone is required")
        .max(20, "Phone must be at most 20 characters")
        .optional(),
    description: z
        .string()
        .trim()
        .min(1, "Description is required")
        .optional(),
    address: z
        .string()
        .trim()
        .min(1, "Address is required")
        .optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field is required to update"
    }
);

export type TUpdateMyVendorPayload = z.infer<typeof updateMyVendorSchema>;

export const vendorValidationSchemas = {
    updateMyVendorSchema
};
