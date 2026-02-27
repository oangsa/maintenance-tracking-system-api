import Elysia from "elysia";
import { UserController } from "../UserController";
import { IServiceManager } from "../../../Applications/Services/Core/IServiceManager";

export class ControllerManager
{
    private readonly userController: UserController;

    constructor(serviceManager: IServiceManager)
    {
        this.userController = new UserController(serviceManager);
    }

    public RegisterRoutes(app: Elysia<any, any, any, any, any, any, any>): void
    {
        this.userController.RegisterRoutes(app);
    }
}
