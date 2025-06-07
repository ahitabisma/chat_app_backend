import { z, ZodType } from "zod";

export class GroupValidation {
    static readonly CREATE: ZodType = z.object({
        name: z.string().min(3, "Group name must be at least 3 characters long"),
        description: z.string().optional(),
        photo: z.string().optional(),
    });

    static readonly UPDATE: ZodType = z.object({
        id: z.number().int("Group ID must be an integer"),
        name: z.string().min(3, "Group name must be at least 3 characters long").optional(),
        description: z.string().optional(),
        photo: z.string().optional(),
    });

    static readonly DELETE: ZodType = z.object({
        id: z.number().int("Group ID must be an integer"),
    });
}