import z from "zod";

const createServiceCategorySchema = z.object({
    name: z
        .string({
            error: "Service category name is required"
        })
        .trim()
        .min(1, "Service category name is required"),
    description: z
        .string()
        .trim()
        .optional()
});

const updateServiceCategorySchema = z.object({
    name: z
        .string({
            error: "Service category name is required"
        })
        .trim()
        .min(1, "Service category name is required")
        .optional(),
    description: z
        .string()
        .trim()
        .optional()
}).refine(
    (data) => data.name !== undefined || data.description !== undefined,
    {
        message: "At least one field is required to update"
    }
);

export type TCreateServiceCategoryPayload = z.infer<typeof createServiceCategorySchema>;
export type TUpdateServiceCategoryPayload = z.infer<typeof updateServiceCategorySchema>;

export const serviceCategoryValidationSchemas = {
    createServiceCategorySchema,
    updateServiceCategorySchema
};
