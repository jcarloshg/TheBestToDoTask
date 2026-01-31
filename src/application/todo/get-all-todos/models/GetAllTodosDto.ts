import { z } from "zod";
import { PriorityEnum } from "../../../shared/sequelize/models/ToDoModel";

const enumValues: [PriorityEnum.HIGH, PriorityEnum.MEDIUM, PriorityEnum.LOW] = [
  PriorityEnum.HIGH,
  PriorityEnum.MEDIUM,
  PriorityEnum.LOW,
];

export const GetAllTodosQuerySchema = z.object({
  priority: z.enum(enumValues).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type GetAllTodosQuery = z.infer<typeof GetAllTodosQuerySchema>;

export const GetAllTodosResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  priority: z.enum(enumValues),
  completed: z.boolean(),
  userId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GetAllTodosItem = z.infer<typeof GetAllTodosResponseSchema>;

export const GetAllTodosPaginationSchema = z.object({
  todos: z.array(GetAllTodosResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type GetAllTodosPaginationResponse = z.infer<
  typeof GetAllTodosPaginationSchema
>;
