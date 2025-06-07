import { z, ZodType } from "zod";

export class MessageValidation {
    static readonly SEND_MESSAGE: ZodType = z.object({
        content: z.string().min(1, "Content cannot be empty"),
        type: z.enum(["TEXT", "FILE"]).default("TEXT"),
        receiverId: z.number(),
        groupId: z.number().optional(),
        file: z.object({
            fileName: z.string().optional(),
            path: z.string().optional(),
            mimeType: z.string().optional(),
            size: z.number().optional(),
        }).optional().nullable()
    });
}