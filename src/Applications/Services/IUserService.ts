import { UserDto } from "../DataTransferObjects/User/UserDto";
import { UserForCreateDto } from "../DataTransferObjects/User/UserForCreateDto";
import { UserForUpdateDto } from "../DataTransferObjects/User/UserForUpdateDto";
import { UserParameter } from "../../Domains/RequestFeatures/UserParameter";
import { PagedResult } from "../../Domains/RequestFeatures/Core/PageResult";

export interface IUserService
{
    GetListUser(parameters: UserParameter): Promise<PagedResult<UserDto>>;
    GetUser(id: number): Promise<UserDto>;
    CreateUser(userForCreateDto: UserForCreateDto): Promise<UserDto>;
    UpdateUser(id: number, userForUpdateDto: UserForUpdateDto): Promise<UserDto>;
    DeleteUser(id: number): Promise<void>;
    DeleteUserCollection(ids: number[]): Promise<void>;
}
