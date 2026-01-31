import { z } from "zod";
import { PriorityEnum } from "../../../shared/sequelize/models/ToDoModel";

const enumValues: [PriorityEnum.HIGH, PriorityEnum.MEDIUM, PriorityEnum.LOW] = [
  PriorityEnum.HIGH,
  PriorityEnum.MEDIUM,
  PriorityEnum.LOW,
];

export const CreateToDoRequestSchema = z.object({
  name: z.string().min(1, "Todo name is required").max(255),
  priority: z.enum(enumValues),
});

export type CreateToDoRequest = z.infer<typeof CreateToDoRequestSchema>;

export const CreateToDoResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  priority: z.enum(enumValues),
  completed: z.boolean(),
  userId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateToDoResponse = z.infer<typeof CreateToDoResponseSchema>;
