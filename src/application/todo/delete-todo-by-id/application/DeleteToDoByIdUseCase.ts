import { IToDoRepository } from "../../../shared/models/IToDoRepository";
import { DeleteToDoByIdResponse } from "../models/DeleteToDoByIdDto";

export class DeleteToDoByIdUseCase {
  constructor(private toDoRepository: IToDoRepository) {}

  async execute(
    userId: string,
    todoId: string,
  ): Promise<DeleteToDoByIdResponse> {
    // Find the todo
    const todo = await this.toDoRepository.findById(todoId);

    if (!todo) {
      throw new Error("Todo not found");
    }

    // Verify ownership
    if (todo.userId !== userId) {
      throw new Error("Unauthorized: You can only delete your own todos");
    }

    // Delete the todo
    await this.toDoRepository.delete(todoId);

    return {
      id: todoId,
      message: "Todo deleted successfully",
    };
  }
}
