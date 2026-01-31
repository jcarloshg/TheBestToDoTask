import { IToDoRepository } from "../../../shared/models/IToDoRepository";
import { PriorityEnum } from "../../../shared/sequelize/models/ToDoModel";
import { GetAllTodosQuery, GetAllTodosPaginationResponse } from "../models/GetAllTodosDto";

export class GetAllTodosUseCase {
  constructor(private toDoRepository: IToDoRepository) {}

  async execute(
    userId: string,
    query: GetAllTodosQuery,
  ): Promise<GetAllTodosPaginationResponse> {
    const { priority, page = 1, limit = 10 } = query;

    // Map string priority to enum if provided
    let priorityEnum: PriorityEnum | undefined;
    if (priority) {
      priorityEnum = priority as PriorityEnum;
    }

    const result = await this.toDoRepository.findByUserIdWithFilters({
      userId,
      priority: priorityEnum,
      page,
      limit,
    });

    return {
      todos: result.todos,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
