import { Model } from "sequelize";

export abstract class BaseModel<T extends Model> extends Model<T> {
  public id!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}
