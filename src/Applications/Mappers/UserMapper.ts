import { UserDto } from "../DataTransferObjects/User/UserDto";
import { User } from "../../Infrastructures/Entities/Master/User";

export interface IUserMapper
{
    UserToDto(user: User): UserDto;
}

export class UserMapper implements IUserMapper
{
    UserToDto(user: User): UserDto
    {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            createdBy: user.createdBy,
            updatedBy: user.updatedBy,
            departmentId: user.department ? user.department.id : null,
            departmentName: user.department ? user.department.name : null,
            departmentCode: user.department ? user.department.code : null,
        };
    }
}
