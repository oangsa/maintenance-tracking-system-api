import { IUserService } from "../../Services/IUserService";
import { ICoreAdapterManager } from "../CoreAdaptorManager";
import { IRepositoryManager } from "../../../Domains/Repositories/Core/IRepositoryManager";
import { IMapperManager } from "../../Mappers/Core/MapperManager";
import { UserDto } from "../../DataTransferObjects/User/UserDto";
import { UserForCreateDto } from "../../DataTransferObjects/User/UserForCreateDto";
import { UserForUpdateDto } from "../../DataTransferObjects/User/UserForUpdateDto";
import { UserParameter } from "../../../Domains/RequestFeatures/UserParameter";
import { PagedResult } from "../../../Domains/RequestFeatures/Core/PageResult";
import { User } from "../../../Infrastructures/Entities/Master/User";
import { UserNotFoundException } from "../../../Domains/Exceptions/User/UserNotFoundException";
import { UserDuplicateBadRequestException } from "../../../Domains/Exceptions/User/UserDuplicateBadRequstException";

export class UserService implements IUserService
{
    private static readonly SystemPlaceholder = "System";

    private readonly _repositoryManager: IRepositoryManager;
    private readonly _mapperManager: IMapperManager;

    constructor(coreAdapterManager: ICoreAdapterManager, mapperManager: IMapperManager)
    {
        this._repositoryManager = coreAdapterManager.repositoryManager;
        this._mapperManager = mapperManager;
    }

    private async GetUserAndCheckIfItExists(id: number): Promise<User>
    {
        const userEntity = await this._repositoryManager.userRepository.GetUserById(id);

        if (!userEntity)
        {
            throw new UserNotFoundException(id);
        }

        return userEntity;
    }

    async GetListUser(parameters: UserParameter): Promise<PagedResult<UserDto>>
    {
        const pagedUsers = await this._repositoryManager.userRepository.GetListUser(parameters);

        return {
            items: pagedUsers.items.map(user => this._mapperManager.userMapper.toDto(user)),
            meta: pagedUsers.meta,
        };
    }

    async GetUser(id: number): Promise<UserDto>
    {
        const userEntity = await this.GetUserAndCheckIfItExists(id);
        return this._mapperManager.userMapper.toDto(userEntity);
    }

    async CreateUser(userForCreateDto: UserForCreateDto): Promise<UserDto>
    {
        const existingUser = await this._repositoryManager.userRepository.GetUserByEmail(userForCreateDto.email, true);

        if (existingUser && !existingUser.deleted)
        {
            throw new UserDuplicateBadRequestException(userForCreateDto.email);
        }

        const dateNow = new Date().toISOString();

        // Restore soft-deleted user instead of inserting a duplicate
        if (existingUser && existingUser.deleted)
        {
            const restoredUser = await this._repositoryManager.userRepository.UpdateUser({
                id: existingUser.id,
                email: userForCreateDto.email,
                passwordHash: userForCreateDto.password,
                name: userForCreateDto.name ?? existingUser.name,
                avatarUrl: userForCreateDto.avatarUrl ?? existingUser.avatarUrl,
                role: userForCreateDto.role.toLowerCase() as User["role"],
                updatedAt: dateNow,
                updatedBy: UserService.SystemPlaceholder,
                deleted: false,
            });
            return this._mapperManager.userMapper.toDto(restoredUser);
        }

        const userEntity: User = {
            id: 0,
            email: userForCreateDto.email,
            passwordHash: userForCreateDto.password,
            name: userForCreateDto.name ?? null,
            avatarUrl: userForCreateDto.avatarUrl ?? null,
            role: userForCreateDto.role.toLowerCase() as User["role"],
            createdAt: dateNow,
            updatedAt: dateNow,
            createdBy: UserService.SystemPlaceholder,
            updatedBy: UserService.SystemPlaceholder,
            deleted: false,
        };

        const createdUser = await this._repositoryManager.userRepository.CreateUser(userEntity);
        return this._mapperManager.userMapper.toDto(createdUser);
    }

    async UpdateUser(id: number, userForUpdateDto: UserForUpdateDto): Promise<UserDto>
    {
        const userEntity = await this.GetUserAndCheckIfItExists(id);

        if (userForUpdateDto.email && userForUpdateDto.email !== userEntity.email)
        {
            const existingUser = await this._repositoryManager.userRepository.GetUserByEmail(userForUpdateDto.email);

            if (existingUser && existingUser.id !== id)
            {
                throw new UserDuplicateBadRequestException(userForUpdateDto.email);
            }
        }

        const updates: Partial<User> = {
            id: userEntity.id,
            email: userForUpdateDto.email ?? userEntity.email,
            passwordHash: userForUpdateDto.password ?? userEntity.passwordHash,
            name: userForUpdateDto.name ?? userEntity.name,
            avatarUrl: userForUpdateDto.avatarUrl ?? userEntity.avatarUrl,
            role: (userForUpdateDto.role?.toLowerCase() as User["role"]) ?? userEntity.role,
            updatedAt: new Date().toISOString(),
            updatedBy: UserService.SystemPlaceholder,
        };

        try
        {
            const updatedUser = await this._repositoryManager.userRepository.UpdateUser(updates);
            return this._mapperManager.userMapper.toDto(updatedUser);
        }
        catch (error: any)
        {
            if (error.code === "23505")
            {
                throw new UserDuplicateBadRequestException(userForUpdateDto.email!);
            }
            throw error;
        }
    }

    async DeleteUser(id: number): Promise<void>
    {
        await this.GetUserAndCheckIfItExists(id);
        await this._repositoryManager.userRepository.DeleteUser(id);
    }

    async DeleteUserCollection(ids: number[]): Promise<void>
    {
        for (const id of ids)
        {
            await this.DeleteUser(id);
        }
    }
}
