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
import { IRepairRequestStatusLogRepository } from "../IRepairRequestStatusLogRepository";
import { IWorkOrderRepository } from "../IWorkOrderRepository";
import { IWorkOrderPartRepository } from "../IWorkOrderPartRepository";
import { IWorkTaskRepository } from "../IWorkTaskRepository";

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
    repairRequestStatusLogRepository: IRepairRequestStatusLogRepository;
    workOrderRepository: IWorkOrderRepository;
    workOrderPartRepository: IWorkOrderPartRepository;
    workTaskRepository: IWorkTaskRepository;
}
