import { IUserRepository } from "../IUserRepository";
import { IRefreshTokenRepository } from "../IRefreshTokenRepository";
import { IDepartmentRepository } from "../IDepartmentRepository";
import { IRepairStatusRepository } from "../IRepairStatusRepository";
import { IPartRepository } from "../IPartRepository";
import { IRepairRequestItemStatusRepository } from "../IRepairRequestItemStatusRepository";
import { IRepairRequestRepository } from "../IRepairRequestRepository";

export interface IRepositoryManager
{
    partRepository: IPartRepository;
    userRepository: IUserRepository;
    departmentRepository: IDepartmentRepository;
    repairStatusRepository: IRepairStatusRepository;
    repairRequestItemStatusRepository: IRepairRequestItemStatusRepository;
    refreshTokenRepository: IRefreshTokenRepository;
    repairRequestRepository: IRepairRequestRepository;
}
