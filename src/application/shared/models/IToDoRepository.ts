import { PriorityEnum } from "../sequelize/models/ToDoModel";

export interface ToDo {
  id: string;
  name: string;
  priority: PriorityEnum;
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ToDoToSave {
  name: string;
  priority: PriorityEnum;
  userId: string;
}

export type ToDoToUpdate = Partial<Pick<ToDo, "name" | "priority" | "completed">>;

export interface IToDoRepository {
  // already exists
  create(toDo: ToDoToSave): Promise<ToDo>;
  update(id: string, toDo: Partial<ToDoToUpdate>): Promise<ToDo>;
  findById(id: string): Promise<ToDo | null>;
  delete(id: string): Promise<void>;
  // not implemented yet
  findByUserId(userId: string): Promise<ToDo[]>;
  findByUserIdAndCompleted(userId: string, completed: boolean): Promise<ToDo[]>;
}
