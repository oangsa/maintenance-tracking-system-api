import { IUserRepository } from "../IUserRepository";
import { IRefreshTokenRepository } from "../IRefreshTokenRepository";
import { IDepartmentRepository } from "../IDepartmentRepository";
import { IRepairRequestItemStatusRepository } from "../IRepairRequestItemStatusRepository";

export interface IRepositoryManager
{
    userRepository: IUserRepository;
    departmentRepository: IDepartmentRepository;
    repairRequestItemStatusRepository: IRepairRequestItemStatusRepository;
    refreshTokenRepository: IRefreshTokenRepository;
}
