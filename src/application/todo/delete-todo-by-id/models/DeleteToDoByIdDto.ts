import { z } from "zod";

export const DeleteToDoByIdResponseSchema = z.object({
  id: z.string().uuid(),
  message: z.string(),
});

export type DeleteToDoByIdResponse = z.infer<
  typeof DeleteToDoByIdResponseSchema
>;
