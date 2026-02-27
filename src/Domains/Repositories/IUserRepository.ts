import { User } from "../../Infrastructures/Entities/Master/User";
import { UserParameter } from "../RequestFeatures/UserParameter";
import { PagedResult } from "../RequestFeatures/Core/PageResult";

export interface IUserRepository {
    GetUserById(id: number): Promise<User | null>;
    GetUserById(id: number): Promise<User | null>;
    GetListUser(parameters: UserParameter): Promise<PagedResult<User>>;
    CreateUser(user: User): Promise<User>;
    UpdateUser(user: Partial<User>): Promise<User>;
    DeleteUser(id: number): Promise<void>;
}
