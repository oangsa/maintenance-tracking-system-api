import { IUserRepository } from "../IUserRepository";
import { IRefreshTokenRepository } from "../IRefreshTokenRepository";
import { IDepartmentRepository } from "../IDepartmentRepository";
import { IRepairStatusRepository } from "../IRepairStatusRepository";

export interface IRepositoryManager
{
    userRepository: IUserRepository;
    departmentRepository: IDepartmentRepository;
    repairStatusRepository: IRepairStatusRepository;
    refreshTokenRepository: IRefreshTokenRepository;
    
}
