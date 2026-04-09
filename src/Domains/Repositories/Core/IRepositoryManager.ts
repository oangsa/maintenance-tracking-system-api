import { IUserRepository } from "../IUserRepository";
import { IRefreshTokenRepository } from "../IRefreshTokenRepository";
import { IDepartmentRepository } from "../IDepartmentRepository";
import { IPartRepository } from "../IPartRepository";
import { IRepairRequestItemStatusRepository } from "../IRepairRequestItemStatusRepository";

export interface IRepositoryManager
{
    partRepository: IPartRepository;
    userRepository: IUserRepository;
    departmentRepository: IDepartmentRepository;
    repairRequestItemStatusRepository: IRepairRequestItemStatusRepository;
    refreshTokenRepository: IRefreshTokenRepository;
}
