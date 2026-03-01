import { IUserService } from "../IUserService";
import { IConfigurationManager } from "../../../Infrastructures/Core/ConfigurationManager";

export interface IServiceManager {
    configurationManager: IConfigurationManager;
    userService: IUserService;
}
