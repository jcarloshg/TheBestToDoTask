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

export interface IToDoRepository {
  create(toDo: ToDoToSave): Promise<ToDo>;
  findById(id: string): Promise<ToDo | null>;
  findByUserId(userId: string): Promise<ToDo[]>;
  update(id: string, toDo: Partial<ToDoToSave>): Promise<ToDo>;
  delete(id: string): Promise<void>;
  findByUserIdAndCompleted(userId: string, completed: boolean): Promise<ToDo[]>;
}
