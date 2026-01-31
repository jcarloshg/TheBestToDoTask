import { DataTypes, Model } from "sequelize";
import SequelizeSingleton from "../index";

export enum PriorityEnum {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

interface ToDoAttributes {
  id?: string;
  name: string;
  priority: PriorityEnum;
  userId: string;
  completed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ToDoModel extends Model<ToDoAttributes> implements ToDoAttributes {
  public id!: string;
  public name!: string;
  public priority!: PriorityEnum;
  public completed!: boolean;
  public userId!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

ToDoModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: false,
      defaultValue: "medium",
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      field: "user_id",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    sequelize: SequelizeSingleton.getInstance(),
    tableName: "todos",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["user_id"],
        name: "idx_todos_user_id",
      },
      {
        fields: ["completed"],
        name: "idx_todos_completed",
      },
    ],
  },
);

export default ToDoModel;
