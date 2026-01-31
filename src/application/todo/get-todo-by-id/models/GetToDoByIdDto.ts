import { z } from "zod";
import { PriorityEnum } from "../../../shared/sequelize/models/ToDoModel";

const enumValues: [PriorityEnum.HIGH, PriorityEnum.MEDIUM, PriorityEnum.LOW] = [
  PriorityEnum.HIGH,
  PriorityEnum.MEDIUM,
  PriorityEnum.LOW,
];

export const GetToDoByIdResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  priority: z.enum(enumValues),
  completed: z.boolean(),
  userId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GetToDoByIdResponse = z.infer<typeof GetToDoByIdResponseSchema>;
