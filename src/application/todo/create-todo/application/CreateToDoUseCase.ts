import { IToDoRepository } from "../../../shared/models/IToDoRepository";
import { CreateToDoRequest, CreateToDoResponse } from "../models/CreateToDoDto";

export class CreateToDoUseCase {
  constructor(private toDoRepository: IToDoRepository) { }

  async execute(
    userId: string,
    request: CreateToDoRequest,
  ): Promise<CreateToDoResponse> {
    // Create the todo
    const createdToDo = await this.toDoRepository.create({
      name: request.name.trim(),
      priority: request.priority,
      userId,
    });

    return {
      id: createdToDo.id,
      name: createdToDo.name,
      priority: createdToDo.priority,
      completed: createdToDo.completed,
      userId: createdToDo.userId,
      createdAt: createdToDo.createdAt,
      updatedAt: createdToDo.updatedAt,
    };
  }
}
