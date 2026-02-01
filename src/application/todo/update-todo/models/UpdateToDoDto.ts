import { z } from "zod";
import { PriorityEnum } from "../../../shared/sequelize/models/ToDoModel";

const enumValues: [PriorityEnum.HIGH, PriorityEnum.MEDIUM, PriorityEnum.LOW] = [
  PriorityEnum.HIGH,
  PriorityEnum.MEDIUM,
  PriorityEnum.LOW,
];

export const UpdateToDoRequestSchema = z.object({
  name: z.string().min(1, "Must be major than 1").optional(),
  priority: z.enum(enumValues).optional(),
  completed: z.boolean().optional(),
});
export type UpdateToDoRequest = z.infer<typeof UpdateToDoRequestSchema>;

export const UpdateToDoResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  priority: z.enum(enumValues),
  completed: z.boolean(),
  userId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UpdateToDoResponse = z.infer<typeof UpdateToDoResponseSchema>;
