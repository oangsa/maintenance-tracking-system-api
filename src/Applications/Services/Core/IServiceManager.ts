import { IUserService } from "../IUserService";
import { IAuthService } from "../IAuthService";
import { IConfigurationManager } from "../../../Infrastructures/Core/ConfigurationManager";
import { UserProvider } from "../../Providers/UserProvider";
import { IDepartmentService } from "../IDepartmentService";

export interface IServiceManager
{
    configurationManager: IConfigurationManager;
    userProvider: UserProvider;

    authService: IAuthService;
    userService: IUserService;
    departmentService: IDepartmentService;
}
