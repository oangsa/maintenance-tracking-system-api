import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { IConfigurationManager } from "../Infrastructures/Core/ConfigurationManager";
import { IServiceManager } from "../Applications/Services/Core/IServiceManager";
import { ControllerManager } from "./Controllers/Core/ControllerManager";
import { ErrorHandlerPlugin } from "./Plugins/ErrorHandlerPlugin";

export class Application
{
    private readonly _app: Elysia;
    private readonly _configurationManager: IConfigurationManager;
    private readonly _controllerManager: ControllerManager;

    constructor(configurationManager: IConfigurationManager, serviceManager: IServiceManager)
    {
        this._configurationManager = configurationManager;

        this._app = new Elysia()
            .use(ErrorHandlerPlugin)
            .use(
                swagger({
                    documentation: {
                        info: {
                            title: "Maintenance Tracking System API",
                            version: "1.0.0",
                            description: "REST API built with Elysia and Drizzle ORM",
                        },
                        tags: [
                            { name: "Authentications", description: "Authentication endpoints" },
                            { name: "Users", description: "User management endpoints" },
                            { name: "Departments", description: "Department management endpoints" },
                        ],
                    },
                    path: "/swagger",
                }),
            );

        this._controllerManager = new ControllerManager(serviceManager);
        this._controllerManager.RegisterRoutes(this._app);
    }

    public start(): void
    {
        const { port } = this._configurationManager.server;

        this._app.listen(port);

        console.log(`🦊 Elysia is running at http://${this._app.server?.hostname}:${this._app.server?.port}`);
        console.log(`📄 Swagger UI available at http://${this._app.server?.hostname}:${this._app.server?.port}/swagger`);
    }
}
