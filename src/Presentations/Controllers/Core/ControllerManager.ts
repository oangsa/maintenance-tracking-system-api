import Elysia from "elysia";
import { AuthenticationController } from "../Auth/AuthenticationController";
import { UserController } from "../Master/UserController";
import { IServiceManager } from "@/Applications/Services/Core/IServiceManager";
import { DepartmentController } from "../Master/DepartmentController";
import { RepairStatusController } from "../Master/RepairStatusController";
import { PartController } from "../Master/PartController";
import { RepairRequestItemStatusController } from "../Master/RepairRequestItemStatusController";
import { RepairRequestController } from "../Features/RepairRequestController";
import { ProductTypeController } from "../Master/ProductTypeController";
import { ProductController } from "../Master/ProductController";
import { ApiConfiguration } from "@/Applications/Services/Core/IConfigurationManager";

export class ControllerManager
{
    private readonly authenticationController: AuthenticationController;
    private readonly userController: UserController;
    private readonly departmentController: DepartmentController;
    private readonly repairStatusController: RepairStatusController;
    private readonly partController: PartController;
    private readonly repairRequestItemStatusController: RepairRequestItemStatusController;
    private readonly repairRequestController: RepairRequestController;
    private readonly productTypeController: ProductTypeController;
    private readonly productController: ProductController;
    private readonly apiVersioningConfiguration: ApiConfiguration;

    constructor(serviceManager: IServiceManager)
    {
        this.authenticationController = new AuthenticationController(serviceManager);
        this.userController = new UserController(serviceManager);
        this.departmentController = new DepartmentController(serviceManager);
        this.repairStatusController = new RepairStatusController(serviceManager);
        this.partController = new PartController(serviceManager);
        this.repairRequestItemStatusController = new RepairRequestItemStatusController(serviceManager);
        this.repairRequestController = new RepairRequestController(serviceManager);
        this.productTypeController = new ProductTypeController(serviceManager);
        this.productController = new ProductController(serviceManager);
        this.apiVersioningConfiguration = serviceManager.configurationManager.api;
    }

    public RegisterRoutes(app: Elysia<any>): void
    {
        for (const version of this.apiVersioningConfiguration.supportedVersions)
        {
            const versionPrefix = this.GetApiVersionPrefix(version);
            const versionedApp = new Elysia({ prefix: versionPrefix })
                .onAfterHandle(({ set }) =>
                {
                    const locationHeader = set.headers["Location"];

                    if (typeof locationHeader === "string" && locationHeader.startsWith("/") && !locationHeader.startsWith("/api/"))
                    {
                        set.headers["Location"] = `${versionPrefix}${locationHeader}`;
                    }
                });

            this.RegisterRoutesByVersion(versionedApp, version);
            app.use(versionedApp);
        }

        this.RegisterVersionDiscoveryRoutes(app);
    }

    private RegisterRoutesByVersion(app: Elysia<any>, version: string): void
    {
        switch (version)
        {
            case "1":
            default:
                this.RegisterV1Routes(app);
                break;
        }
    }

    private RegisterVersionDiscoveryRoutes(app: Elysia<any>): void
    {
        app.get(
            "/api/versions",
            () =>
            {
                return {
                    supportedVersions: this.apiVersioningConfiguration.supportedVersions.map((version) => `v${version}`),
                    defaultVersion: `v${this.apiVersioningConfiguration.defaultVersion}`,
                };
            },
            {
                detail: {
                    summary: "Get supported API versions",
                    tags: ["Versioning"],
                },
            },
        );
    }

    private GetApiVersionPrefix(version: string): string
    {
        return `/api/v${version}`;
    }

    private RegisterV1Routes(app: Elysia<any>): void
    {
        this.authenticationController.RegisterRoutes(app);
        this.userController.RegisterRoutes(app);
        this.departmentController.RegisterRoutes(app);
        this.repairStatusController.RegisterRoutes(app);
        this.partController.RegisterRoutes(app);
        this.repairRequestItemStatusController.RegisterRoutes(app);
        this.repairRequestController.RegisterRoutes(app);
        this.productTypeController.RegisterRoutes(app);
        this.productController.RegisterRoutes(app);
    }
}
