import { IUserService } from "../IUserService";
import { IAuthService } from "../IAuthService";
import { IConfigurationManager } from "./IConfigurationManager";
import { UserProvider } from "../../Providers/UserProvider";
import { IDepartmentService } from "../IDepartmentService";
import { ILoggerService } from "../ILoggerService";

export interface IServiceManager
{
    configurationManager: IConfigurationManager;
    userProvider: UserProvider;
    loggerService: ILoggerService;

    authService: IAuthService;
    userService: IUserService;
    departmentService: IDepartmentService;
    partService: IPartService;
}
