import z from "zod";

const updateUserStatusSchema = z.object({
    isActive: z.boolean({
        error: "isActive is required"
    })
});

const updateVendorApprovalSchema = z.object({
    isApproved: z.boolean({
        error: "isApproved is required"
    })
});

export type TUpdateUserStatusPayload = z.infer<typeof updateUserStatusSchema>;
export type TUpdateVendorApprovalPayload = z.infer<typeof updateVendorApprovalSchema>;

export const adminValidationSchemas = {
    updateUserStatusSchema,
    updateVendorApprovalSchema
};
