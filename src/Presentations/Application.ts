import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { IConfigurationManager } from "@/Applications/Services/Core/IConfigurationManager";
import { IServiceManager } from "@/Applications/Services/Core/IServiceManager";
import { ControllerManager } from "./Controllers/Core/ControllerManager";
import { ErrorHandlerPlugin } from "./Plugins/ErrorHandlerPlugin";
import { RequestLoggerPlugin } from "./Plugins/RequestLoggerPlugin";
import { ApiVersionValidatorPlugin } from "./Plugins/ApiVersionValidatorPlugin";

export class Application
{
    private readonly _app: any;
    private readonly _configurationManager: IConfigurationManager;
    private readonly _controllerManager: ControllerManager;
    private readonly _serviceManager: IServiceManager;

    private readonly _corsOrigin: string = process.env["ORIGIN"] ?? "http://localhost:5173";

    constructor(configurationManager: IConfigurationManager, serviceManager: IServiceManager)
    {
        this._configurationManager = configurationManager;
        this._serviceManager = serviceManager;

        this._app = new Elysia()
            .use(cors({ origin: this._corsOrigin }))
            .use(RequestLoggerPlugin(this._serviceManager.loggerService))
            .use(ErrorHandlerPlugin(this._serviceManager.loggerService))
            .use(ApiVersionValidatorPlugin(this._configurationManager.api))
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
                            { name: "Parts", description: "Part management endpoints" },
                            { name: "Repair Status", description: "Repair status management endpoints" },
                            { name: "Repair Request Item Statuses", description: "Repair request item status management endpoints" },
                            { name: "Repair Requests", description: "Repair request management endpoints" },
                            { name: "Product Types", description: "Product type management endpoints" },
                            { name: "Products", description: "Product management endpoints" },
                            { name: "Versioning", description: "API version discovery endpoints" },
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

        const host = this._app.server?.hostname ?? "localhost";
        const appPort = this._app.server?.port ?? port;

        this._serviceManager.loggerService.info("Server started", {
            host,
            port: appPort,
            swaggerUrl: `http://${host}:${appPort}/swagger`,
        });
    }
}
