import { IUserRepository } from "../IUserRepository";
import { IRefreshTokenRepository } from "../IRefreshTokenRepository";
import { IDepartmentRepository } from "../IDepartmentRepository";

export interface IRepositoryManager
{
    userRepository: IUserRepository;
    departmentRepository: IDepartmentRepository;
    refreshTokenRepository: IRefreshTokenRepository;
}
