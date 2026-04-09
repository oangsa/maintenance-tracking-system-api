import { IUserRepository } from "../IUserRepository";
import { IRefreshTokenRepository } from "../IRefreshTokenRepository";
import { IDepartmentRepository } from "../IDepartmentRepository";
import { IPartRepository } from "../IPartRepository";

export interface IRepositoryManager
{
    partRepository: IPartRepository;
    userRepository: IUserRepository;
    departmentRepository: IDepartmentRepository;
    refreshTokenRepository: IRefreshTokenRepository;
}
