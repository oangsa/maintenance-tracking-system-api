import { IUserService } from "../IUserService";
import { IAuthService } from "../IAuthService";
import { IConfigurationManager } from "../../../Infrastructures/Core/ConfigurationManager";

export interface IServiceManager
{
    configurationManager: IConfigurationManager;
    authService: IAuthService;
    userService: IUserService;
}
