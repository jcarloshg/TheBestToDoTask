import { DataTypes, Model } from "sequelize";
import SequelizeSingleton from "../index";

interface UserAttributes {
  id: string;
  nombre: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserModel extends Model<UserAttributes> implements UserAttributes {
  public id!: string;
  public nombre!: string;
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
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: SequelizeSingleton.getInstance(),
    tableName: "users",
    timestamps: true,
    underscored: true,
  },
);

export default UserModel;
