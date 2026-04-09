import Elysia from "elysia";
import { AuthenticationController } from "../Auth/AuthenticationController";
import { UserController } from "../Master/UserController";
import { IServiceManager } from "../../../Applications/Services/Core/IServiceManager";
import { DepartmentController } from "../Master/DepartmentController";
import { RepairRequestItemStatusController } from "../Master/RepairRequestItemStatusController";

export class ControllerManager
{
    private readonly authenticationController: AuthenticationController;
    private readonly userController: UserController;
    private readonly departmentController: DepartmentController;
    private readonly repairRequestItemStatusController: RepairRequestItemStatusController;

    constructor(serviceManager: IServiceManager)
    {
        this.authenticationController = new AuthenticationController(serviceManager);
        this.userController = new UserController(serviceManager);
        this.departmentController = new DepartmentController(serviceManager);
        this.repairRequestItemStatusController = new RepairRequestItemStatusController(serviceManager);
    }

    public RegisterRoutes(app: Elysia<any>): void
    {
        this.authenticationController.RegisterRoutes(app);
        this.userController.RegisterRoutes(app);
        this.departmentController.RegisterRoutes(app);
        this.repairRequestItemStatusController.RegisterRoutes(app);
    }
}
