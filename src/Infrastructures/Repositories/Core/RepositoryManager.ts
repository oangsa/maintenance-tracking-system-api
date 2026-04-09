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

export class RepositoryManager implements IRepositoryManager
{
    private readonly _userRepository: IUserRepository;
    private readonly _refreshTokenRepository: IRefreshTokenRepository;
    private readonly _departmentRepository: IDepartmentRepository;
    private readonly _repairStatusRepository: IRepairStatusRepository;
    private readonly _partRepository: IPartRepository;
    private readonly _repairRequestItemStatusRepository: IRepairRequestItemStatusRepository;

    constructor()
    {
        const drizzleDb = DrizzleFactory.getInstance();
        this._userRepository = new UserRepository(drizzleDb);
        this._refreshTokenRepository = new RefreshTokenRepository(drizzleDb);
        this._departmentRepository = new DepartmentRepository(drizzleDb);
        this._repairStatusRepository = new RepairStatusRepository(drizzleDb);
        this._partRepository = new PartRepository(drizzleDb);
        this._repairRequestItemStatusRepository = new RepairRequestItemStatusRepository(drizzleDb);
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
}
