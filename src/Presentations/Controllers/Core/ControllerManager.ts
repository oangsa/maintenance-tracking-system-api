import Elysia from "elysia";
import { AuthenticationController } from "../Auth/AuthenticationController";
import { UserController } from "../Master/UserController";
import { IServiceManager } from "../../../Applications/Services/Core/IServiceManager";

export class ControllerManager
{
    private readonly authenticationController: AuthenticationController;
    private readonly userController: UserController;

    constructor(serviceManager: IServiceManager)
    {
        this.authenticationController = new AuthenticationController(serviceManager);
        this.userController = new UserController(serviceManager);
    }

    public RegisterRoutes(app: Elysia<any, any, any, any, any, any, any>): void
    {
        this.authenticationController.RegisterRoutes(app);
        this.userController.RegisterRoutes(app);
    }
}
