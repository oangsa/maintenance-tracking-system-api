import { IUserService } from "../IUserService";
import { IConfigurationManager } from "../../../Infrastructures/Core/IConfigurationManager";

export interface IServiceManager {
    configurationManager: IConfigurationManager;
    userService: IUserService;
}
