import { IToDoRepository, ToDo, ToDoToSave } from "../models/IToDoRepository";
import ToDoModel from "./models/ToDoModel";

export class ToDoRepoPostgreSql implements IToDoRepository {
    /**
     * Create a new todo
     */
    async create(toDo: ToDoToSave): Promise<ToDo> {
        const createdToDo = await ToDoModel.create({
            name: toDo.name,
            priority: toDo.priority,
            userId: toDo.userId,
        });

        if (!createdToDo || !createdToDo.dataValues) {
            throw new Error("Failed to create todo");
        }

        return this.mapToDoModelToToDo(createdToDo);
    }

    /**
     * Find a todo by id
     */
    async findById(id: string): Promise<ToDo | null> {
        const todo = await ToDoModel.findByPk(id);

        if (!todo) return null;

        return this.mapToDoModelToToDo(todo);
    }

    /**
     * Find all todos for a specific user
     */
    async findByUserId(userId: string): Promise<ToDo[]> {
        const todos = await ToDoModel.findAll({
            where: { userId },
            order: [["createdAt", "DESC"]],
        });

        return todos.map((todo) => this.mapToDoModelToToDo(todo));
    }

    /**
     * Update a todo
     */
    async update(id: string, toDo: Partial<ToDoToSave>): Promise<ToDo> {
        await ToDoModel.update(
            {
                ...(toDo.name && { name: toDo.name }),
                ...(toDo.priority && { priority: toDo.priority }),
            },
            {
                where: { id },
            },
        );

        const updatedToDo = await ToDoModel.findByPk(id);

        if (!updatedToDo) {
            throw new Error("Todo not found after update");
        }

        return this.mapToDoModelToToDo(updatedToDo);
    }

    /**
     * Delete a todo
     */
    async delete(id: string): Promise<void> {
        const deleted = await ToDoModel.destroy({
            where: { id },
        });

        if (deleted === 0) {
            throw new Error("Todo not found");
        }
    }

    /**
     * Find todos filtered by completion status
     */
    async findByUserIdAndCompleted(
        userId: string,
        completed: boolean,
    ): Promise<ToDo[]> {
        const todos = await ToDoModel.findAll({
            where: { userId, completed },
            order: [["createdAt", "DESC"]],
        });

        return todos.map((todo) => this.mapToDoModelToToDo(todo));
    }

    /**
     * Helper method to map ToDoModel to ToDo domain object
     */
    private mapToDoModelToToDo(model: ToDoModel): ToDo {
        return {
            id: model.id,
            name: model.name,
            priority: model.priority,
            completed: model.completed,
            userId: model.userId,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt,
        };
    }
}

// Singleton instance
export const ToDoRepoPostgreSqlImp = new ToDoRepoPostgreSql();
