import { IServiceManager } from "../../Services/Core/IServiceManager";
import { IUserService } from "../../Services/IUserService";
import { UserService } from "../Master/UserService";
import { ICoreAdapterManager } from "../CoreAdaptorManager";

export class ServiceManager implements IServiceManager
{
    private readonly _userService: IUserService;

    constructor(coreAdapterManager: ICoreAdapterManager)
    {
        this._userService = new UserService(coreAdapterManager);
    }

    get userService(): IUserService
    {
        return this._userService;
    }
}
