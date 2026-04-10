import { IServiceManager } from "../../Services/Core/IServiceManager";
import { IAuthService } from "../../Services/IAuthService";
import { IUserService } from "../../Services/IUserService";
import { IMapperManager } from "../../Mappers/Core/MapperManager";
import { MapperManager } from "../../Mappers/Core/MapperManager";
import { AuthService } from "../Auth/AuthService";
import { UserService } from "../Master/UserService";
import { ICoreAdapterManager } from "../CoreAdapterManager";
import { IConfigurationManager } from "../../Services/Core/IConfigurationManager";
import { UserProvider } from "../../Providers/UserProvider";
import { IDepartmentService } from "../../Services/IDepartmentService";
import { DepartmentService } from "../Master/DepartmentService";
import { IRepairStatusService } from "../../Services/IRepairStatusService";
import { RepairStatusService } from "../Master/RepairStatusService";
import { IPartService } from "../../Services/IPartService";
import { PartService } from "../Master/PartService";
import { ILoggerService } from "../../Services/ILoggerService";
import { IRepairRequestItemStatusService } from "../../Services/IRepairRequestItemStatusService";
import { RepairRequestItemStatusService } from "../Master/RepairRequestItemStatusService";
import { IRepairRequestService } from "../../Services/IRepairRequestService";
import { RepairRequestService } from "../Features/RepairRequest/RepairRequestService";

export class ServiceManager implements IServiceManager
{
    private readonly _coreAdapterManager: ICoreAdapterManager;
    private readonly _userProvider: UserProvider;
    private readonly _authService: IAuthService;
    private readonly _userService: IUserService;
    private readonly _departmentService: IDepartmentService;
    private readonly _repairStatusService: IRepairStatusService;
    private readonly _partService: IPartService;
    private readonly _repairRequestItemStatusService: IRepairRequestItemStatusService;
    private readonly _repairRequestService: IRepairRequestService;

    constructor(coreAdapterManager: ICoreAdapterManager)
    {
        this._coreAdapterManager = coreAdapterManager;

        const mapperManager: IMapperManager = new MapperManager();
        this._userProvider = new UserProvider();

        this._authService = new AuthService(coreAdapterManager, mapperManager);
        this._userService = new UserService(coreAdapterManager, mapperManager, this._userProvider);
        this._departmentService = new DepartmentService(coreAdapterManager, mapperManager, this._userProvider);
        this._repairStatusService = new RepairStatusService(coreAdapterManager, mapperManager, this._userProvider);
        this._partService = new PartService(coreAdapterManager, mapperManager, this._userProvider);
        this._repairRequestItemStatusService = new RepairRequestItemStatusService(coreAdapterManager, mapperManager, this._userProvider);
        this._repairRequestService = new RepairRequestService(coreAdapterManager, mapperManager, this._userProvider);
    }

    get configurationManager(): IConfigurationManager
    {
        return this._coreAdapterManager.configurationManager;
    }

    get userProvider(): UserProvider
    {
        return this._userProvider;
    }

    get loggerService(): ILoggerService
    {
        return this._coreAdapterManager.loggerService;
    }

    get authService(): IAuthService
    {
        return this._authService;
    }

    get userService(): IUserService
    {
        return this._userService;
    }

    get departmentService(): IDepartmentService
    {
        return this._departmentService;
    }

    get repairStatusService(): IRepairStatusService
    {
        return this._repairStatusService;
    }
    
  
    get partService(): IPartService
    {
        return this._partService;
    }

    get repairRequestItemStatusService(): IRepairRequestItemStatusService
    {
        return this._repairRequestItemStatusService;
    }

    get repairRequestService(): IRepairRequestService
    {
        return this._repairRequestService;
    }
}
