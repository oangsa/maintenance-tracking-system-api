import { IRepositoryManager } from "@/Domains/Repositories/Core/IRepositoryManager";
import { IUserRepository } from "@/Domains/Repositories/IUserRepository";
import { IRefreshTokenRepository } from "@/Domains/Repositories/IRefreshTokenRepository";
import { UserRepository } from "../Master/UserRepository";
import { RefreshTokenRepository } from "../Auth/RefreshTokenRepository";
import { DrizzleFactory } from "../../Database";
import { IDepartmentRepository } from "@/Domains/Repositories/IDepartmentRepository";
import { DepartmentRepository } from "../Master/DepartmentRepository";
import { IRepairStatusRepository } from "@/Domains/Repositories/IRepairStatusRepository";
import { RepairStatusRepository } from "../Master/RepairStatusRepository";
import { IPartRepository } from "@/Domains/Repositories/IPartRepository";
import { PartRepository } from "../Master/PartRepository";
import { IRepairRequestItemStatusRepository } from "@/Domains/Repositories/IRepairRequestItemStatusRepository";
import { RepairRequestItemStatusRepository } from "../Master/RepairRequestItemStatusRepository";
import { IInventoryMoveRepository } from "@/Domains/Repositories/IInventoryMoveRepository";
import { InventoryMoveRepository } from "../Master/InventoryMoveRepository";
import { IRepairRequestRepository } from "@/Domains/Repositories/IRepairRequestRepository";
import { RepairRequestRepository } from "../Features/RepairRequest/RepairRequestRepository";
import { IProductTypeRepository } from "@/Domains/Repositories/IProductTypeRepository";
import { ProductTypeRepository } from "../Master/ProductTypeRepository";
import { IProductRepository } from "@/Domains/Repositories/IProductRepository";
import { ProductRepository } from "../Master/ProductRepository";

export class RepositoryManager implements IRepositoryManager
{
    private readonly _userRepository: IUserRepository;
    private readonly _refreshTokenRepository: IRefreshTokenRepository;
    private readonly _departmentRepository: IDepartmentRepository;
    private readonly _repairStatusRepository: IRepairStatusRepository;
    private readonly _partRepository: IPartRepository;
    private readonly _repairRequestItemStatusRepository: IRepairRequestItemStatusRepository;
    private readonly _inventoryMoveRepository: IInventoryMoveRepository;
    private readonly _repairRequestRepository: IRepairRequestRepository;
    private readonly _productTypeRepository: IProductTypeRepository;
    private readonly _productRepository: IProductRepository;

    constructor()
    {
        const drizzleDb = DrizzleFactory.getInstance();
        this._userRepository = new UserRepository(drizzleDb);
        this._refreshTokenRepository = new RefreshTokenRepository(drizzleDb);
        this._departmentRepository = new DepartmentRepository(drizzleDb);
        this._repairStatusRepository = new RepairStatusRepository(drizzleDb);
        this._partRepository = new PartRepository(drizzleDb);
        this._repairRequestItemStatusRepository = new RepairRequestItemStatusRepository(drizzleDb);
        this._inventoryMoveRepository = new InventoryMoveRepository(drizzleDb);
        this._repairRequestRepository = new RepairRequestRepository(drizzleDb);
        this._productTypeRepository = new ProductTypeRepository(drizzleDb);
        this._productRepository = new ProductRepository(drizzleDb);
    }

    get userRepository(): IUserRepository
    {
        return this._userRepository;
    }

    get refreshTokenRepository(): IRefreshTokenRepository
    {
        return this._refreshTokenRepository;
    }

    get departmentRepository(): IDepartmentRepository
    {
        return this._departmentRepository;
    }

    get repairStatusRepository(): IRepairStatusRepository
    {
        return this._repairStatusRepository;
    }

    get partRepository(): IPartRepository
    {
        return this._partRepository;
    }

    get repairRequestItemStatusRepository(): IRepairRequestItemStatusRepository
    {
        return this._repairRequestItemStatusRepository;
    }

    get inventoryMoveRepository(): IInventoryMoveRepository
    {
        return this._inventoryMoveRepository;
    }
    get repairRequestRepository(): IRepairRequestRepository
    {
        return this._repairRequestRepository;
    }

    get productTypeRepository(): IProductTypeRepository
    {
        return this._productTypeRepository;
    }

    get productRepository(): IProductRepository
    {
        return this._productRepository;
    }
}
