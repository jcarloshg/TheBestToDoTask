import { IToDoRepository } from "../../../shared/models/IToDoRepository";
import { GetToDoByIdResponse } from "../models/GetToDoByIdDto";

export class GetToDoByIdUseCase {
  constructor(private toDoRepository: IToDoRepository) {}

  async execute(
    userId: string,
    todoId: string,
  ): Promise<GetToDoByIdResponse> {
    // Find the todo
    const todo = await this.toDoRepository.findById(todoId);

    if (!todo) {
      throw new Error("Todo not found");
    }

    // Verify ownership
    if (todo.userId !== userId) {
      throw new Error("Unauthorized: You can only view your own todos");
    }

    return {
      id: todo.id,
      name: todo.name,
      priority: todo.priority,
      completed: todo.completed,
      userId: todo.userId,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    };
  }
}
