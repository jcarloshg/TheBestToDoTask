import { DataTypes, Model } from "sequelize";
import SequelizeSingleton from "../index";

interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string; // Stores the hashed password
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserModel extends Model<UserAttributes> implements UserAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

UserModel.init(
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
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Stores the hashed password using Argon2",
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
    tableName: "users",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["email"],
        name: "idx_users_email",
      },
    ],
  },
);

export default UserModel;
