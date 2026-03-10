import { IServiceManager } from "../../Services/Core/IServiceManager";
import { IAuthService } from "../../Services/IAuthService";
import { IUserService } from "../../Services/IUserService";
import { IMapperManager } from "../../Mappers/Core/MapperManager";
import { MapperManager } from "../../Mappers/Core/MapperManager";
import { AuthService } from "../Auth/AuthService";
import { UserService } from "../Master/UserService";
import { ICoreAdapterManager } from "../CoreAdapterManager";
import { IConfigurationManager } from "../../../Infrastructures/Core/ConfigurationManager";
import { UserProvider } from "../../Providers/UserProvider";
import { IDepartmentService } from "../../Services/IDepartmentService";
import { DepartmentService } from "../Master/DepartmentService";

export class ServiceManager implements IServiceManager
{
    private readonly _coreAdapterManager: ICoreAdapterManager;
    private readonly _userProvider: UserProvider;
    private readonly _authService: IAuthService;
    private readonly _userService: IUserService;
    private readonly _departmentService: IDepartmentService;

    constructor(coreAdapterManager: ICoreAdapterManager)
    {
        this._coreAdapterManager = coreAdapterManager;

        const mapperManager: IMapperManager = new MapperManager();
        this._userProvider = new UserProvider();

        this._authService = new AuthService(coreAdapterManager, mapperManager);
        this._userService = new UserService(coreAdapterManager, mapperManager, this._userProvider);
        this._departmentService = new DepartmentService(coreAdapterManager, mapperManager, this._userProvider);
    }

    get configurationManager(): IConfigurationManager
    {
        return this._coreAdapterManager.configurationManager;
    }

    get userProvider(): UserProvider
    {
        return this._userProvider;
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
}
