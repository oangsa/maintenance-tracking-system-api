import { IUserRepository } from "../IUserRepository";
import { IRefreshTokenRepository } from "../IRefreshTokenRepository";
import { IDepartmentRepository } from "../IDepartmentRepository";
import { IRepairStatusRepository } from "../IRepairStatusRepository";
import { IPartRepository } from "../IPartRepository";
import { IRepairRequestItemStatusRepository } from "../IRepairRequestItemStatusRepository";
import { IInventoryMoveRepository } from "../IInventoryMoveRepository";
import { IRepairRequestRepository } from "../IRepairRequestRepository";
import { IProductTypeRepository } from "../IProductTypeRepository";
import { IProductRepository } from "../IProductRepository";

export interface IRepositoryManager
{
    partRepository: IPartRepository;
    userRepository: IUserRepository;
    departmentRepository: IDepartmentRepository;
    repairStatusRepository: IRepairStatusRepository;
    repairRequestItemStatusRepository: IRepairRequestItemStatusRepository;
    refreshTokenRepository: IRefreshTokenRepository;
    inventoryMoveRepository: IInventoryMoveRepository;
    repairRequestRepository: IRepairRequestRepository;
    productTypeRepository: IProductTypeRepository;
    productRepository: IProductRepository;
}
