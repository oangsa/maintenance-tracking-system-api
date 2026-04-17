import Elysia from "elysia";
import { AuthenticationController } from "../Auth/AuthenticationController";
import { UserController } from "../Master/UserController";
import { IServiceManager } from "../../../Applications/Services/Core/IServiceManager";
import { DepartmentController } from "../Master/DepartmentController";
import { RepairStatusController } from "../Master/RepairStatusController";
import { PartController } from "../Master/PartController";
import { RepairRequestItemStatusController } from "../Master/RepairRequestItemStatusController";
import { InventoryMoveController } from "../Master/InventoryMoveController";

export class ControllerManager
{
    private readonly authenticationController: AuthenticationController;
    private readonly userController: UserController;
    private readonly departmentController: DepartmentController;
    private readonly repairStatusController: RepairStatusController;
    private readonly partController: PartController;
    private readonly repairRequestItemStatusController: RepairRequestItemStatusController;
    private readonly inventoryMoveController: InventoryMoveController;

    constructor(serviceManager: IServiceManager)
    {
        this.authenticationController = new AuthenticationController(serviceManager);
        this.userController = new UserController(serviceManager);
        this.departmentController = new DepartmentController(serviceManager);
        this.repairStatusController = new RepairStatusController(serviceManager);
        this.partController = new PartController(serviceManager);
        this.repairRequestItemStatusController = new RepairRequestItemStatusController(serviceManager);
        this.inventoryMoveController = new InventoryMoveController(serviceManager);
    }

    public RegisterRoutes(app: Elysia<any>): void
    {
        this.authenticationController.RegisterRoutes(app);
        this.userController.RegisterRoutes(app);
        this.departmentController.RegisterRoutes(app);
        this.repairStatusController.RegisterRoutes(app);
        this.partController.RegisterRoutes(app);
        this.repairRequestItemStatusController.RegisterRoutes(app);
        this.inventoryMoveController.RegisterRoutes(app);
    }
}
