import { IToDoRepository } from "../../../shared/models/IToDoRepository";
import {
  UpdateToDoRequest,
  UpdateToDoResponse,
} from "../models/UpdateToDoDto";

export class UpdateToDoUseCase {
  constructor(private toDoRepository: IToDoRepository) { }

  async execute(
    userId: string,
    todoId: string,
    request: UpdateToDoRequest,
  ): Promise<UpdateToDoResponse> {

    // Verify that the todo exists
    const todo = await this.toDoRepository.findById(todoId);
    if (!todo) {
      throw new Error("Todo not found");
    }

    // Check ownership
    if (todo.userId != userId) {
      throw new Error("Unauthorized: You can only update your own todos");
    }

    // Update the todo
    const updateData = {
      ...(request.name && { name: request.name.trim() }),
      ...(request.priority && { priority: request.priority }),
      ...(request.completed !== undefined && { completed: request.completed }),
    };

    const updatedToDo = await this.toDoRepository.update(todoId, updateData);

    return {
      id: updatedToDo.id,
      name: updatedToDo.name,
      priority: updatedToDo.priority,
      completed: updatedToDo.completed,
      userId: updatedToDo.userId,
      createdAt: updatedToDo.createdAt,
      updatedAt: updatedToDo.updatedAt,
    };
  }
}
