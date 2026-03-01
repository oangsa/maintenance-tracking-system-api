import { IServiceManager } from "../../Services/Core/IServiceManager";
import { IUserService } from "../../Services/IUserService";
import { UserService } from "../Master/UserService";
import { ICoreAdapterManager } from "../CoreAdaptorManager";
import { IConfigurationManager } from "../../../Infrastructures/Core/ConfigurationManager";

export class ServiceManager implements IServiceManager
{
    private readonly _coreAdapterManager: ICoreAdapterManager;
    private readonly _userService: IUserService;

    constructor(coreAdapterManager: ICoreAdapterManager)
    {
        this._coreAdapterManager = coreAdapterManager;
        this._userService = new UserService(coreAdapterManager);
    }

    get configurationManager(): IConfigurationManager
    {
        return this._coreAdapterManager.configurationManager;
    }

    get userService(): IUserService
    {
        return this._userService;
    }
}
