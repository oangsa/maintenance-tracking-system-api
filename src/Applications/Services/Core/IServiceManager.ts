import { IUserService } from "../IUserService";
import { IAuthService } from "../IAuthService";
import { IConfigurationManager } from "../../../Infrastructures/Core/ConfigurationManager";
import { UserProvider } from "../../Providers/UserProvider";

export interface IServiceManager
{
    configurationManager: IConfigurationManager;
    userProvider: UserProvider;
    authService: IAuthService;
    userService: IUserService;
}
