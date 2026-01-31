import UserModel from "./UserModel";
import RefreshTokenModel from "./RefreshTokenModel";
import ToDoModel from "./ToDoModel";

export { UserModel, RefreshTokenModel, ToDoModel };

export const Models = {
  User: UserModel,
  RefreshToken: RefreshTokenModel,
  ToDo: ToDoModel,
};

export default Models;
