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

        return {
            id: createdToDo.dataValues.id!,
            completed: createdToDo.dataValues.completed!,
            name: createdToDo.dataValues.name,
            priority: createdToDo.dataValues.priority,
            userId: createdToDo.dataValues.userId,
            createdAt: createdToDo.dataValues.createdAt!,
            updatedAt: createdToDo.dataValues.updatedAt!,
        };

        // return this.mapToDoModelToToDo(createdToDo);
    }

    /**
     * Find a todo by id
     */
    async findById(id: string): Promise<ToDo | null> {
        const todo = await ToDoModel.findByPk(id);

        if (!todo || !todo.dataValues) return null;

        // return this.mapToDoModelToToDo(todo);

        return {
            id: todo.dataValues.id!,
            name: todo.dataValues.name,
            priority: todo.dataValues.priority,
            completed: todo.dataValues.completed!,
            userId: todo.dataValues.userId,
            createdAt: todo.dataValues.createdAt!,
            updatedAt: todo.dataValues.updatedAt!,
        };
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

        if (!updatedToDo || !updatedToDo.dataValues) {
            throw new Error("Todo not found after update");
        }

        // return this.mapToDoModelToToDo(updatedToDo);
        return {
            id: updatedToDo.dataValues.id!,
            name: updatedToDo.dataValues.name,
            priority: updatedToDo.dataValues.priority,
            completed: updatedToDo.dataValues.completed!,
            userId: updatedToDo.dataValues.userId,
            createdAt: updatedToDo.dataValues.createdAt!,
            updatedAt: updatedToDo.dataValues.updatedAt!,
        }
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
