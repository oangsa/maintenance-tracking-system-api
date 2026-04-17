import { IUserService } from "../IUserService";
import { IAuthService } from "../IAuthService";
import { IConfigurationManager } from "./IConfigurationManager";
import { UserProvider } from "../../Providers/UserProvider";
import { IDepartmentService } from "../IDepartmentService";
import { IRepairStatusService } from "../../Services/IRepairStatusService";
import { IPartService } from "../IPartService";
import { ILoggerService } from "../ILoggerService";
import { IRepairRequestItemStatusService } from "../IRepairRequestItemStatusService";
import { IRepairRequestService } from "../IRepairRequestService";
import { IProductTypeService } from "../IProductTypeService";
import { IWorkOrderService } from "../IWorkOrderService";

export interface IServiceManager
{
    configurationManager: IConfigurationManager;
    userProvider: UserProvider;
    loggerService: ILoggerService;

    authService: IAuthService;
    userService: IUserService;
    departmentService: IDepartmentService;
    repairStatusService: IRepairStatusService;
    partService: IPartService;
    repairRequestItemStatusService: IRepairRequestItemStatusService;
    repairRequestService: IRepairRequestService;
    productTypeService: IProductTypeService;
    workOrderService: IWorkOrderService;
}
