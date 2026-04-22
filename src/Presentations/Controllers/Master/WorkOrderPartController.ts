import { Elysia } from "elysia";
import { IServiceManager } from "../../../Applications/Services/Core/IServiceManager";
import { JwtPlugin } from "../../Plugins/JwtPlugin";
import { ForbiddenException } from "../../../Domains/Exceptions/ForbiddenException";
import { WorkOrderPartParameter } from "../../../Domains/RequestFeatures/WorkOrderPartParameter";
import { WorkOrderPartForCreateSchema, WorkOrderPartForUpdateSchema, WorkOrderPartIdParamSchema, WorkOrderPartParameterSchema, DeleteCollectionSchema } from "../../Validators/WorkOrderPartSchemaValidation";
import { WorkOrderPartNotFoundException } from "../../../Domains/Exceptions/WorkOrderPart/WorkOrderPartNotFoundException";
import { WorkOrderPartDuplicateBadRequestException } from "../../../Domains/Exceptions/WorkOrderPart/WorkOrderPartDuplicateBadRequestException";
import { WorkOrderPartAlreadyConsumedBadRequestException } from "../../../Domains/Exceptions/WorkOrderPart/WorkOrderPartAlreadyConsumedBadRequestException";
import { WorkOrderNotFoundException } from "../../../Domains/Exceptions/WorkOrder/WorkOrderNotFoundException";
import { PartNotFoundException } from "../../../Domains/Exceptions/Part/PartNotFoundException";

export class WorkOrderPartController
{
    private readonly _service: IServiceManager;

    constructor(service: IServiceManager)
    {
        this._service = service;
    }

    public RegisterRoutes(app: Elysia<any>): void
    {
        const { secret } = this._service.configurationManager.jwt;

        app.group("/work-order-part", (app) =>
            app
                .use(JwtPlugin(secret, this._service.authService))
                .post(
                    "/search",
                    async ({ body, currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            try
                            {
                                const params: WorkOrderPartParameter = {
                                    pageNumber: body.pageNumber ?? 1,
                                    pageSize: body.pageSize ?? 10,
                                    orderBy: body.orderBy as WorkOrderPartParameter["orderBy"],
                                    search: body.search,
                                    searchTerm: body.searchTerm,
                                };

                                const result = await this._service.workOrderPartService.GetListWorkOrderPart(params);

                                set.headers["X-Pagination"] = JSON.stringify(result.meta);
                                set.status = 200;

                                return result.items;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        body: WorkOrderPartParameterSchema,
                        detail: { summary: "Search work order parts", tags: ["Work Order Parts"] },
                    },
                )
                .get(
                    "/:id",
                    async ({ params, currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            try
                            {
                                const id = parseInt(params.id, 10);
                                const workOrderPart = await this._service.workOrderPartService.GetWorkOrderPart(id);
                                set.status = 200;

                                return workOrderPart;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: WorkOrderPartIdParamSchema,
                        detail: { summary: "Get work order part by ID", tags: ["Work Order Parts"] },
                    },
                )
                .post(
                    "/",
                    async ({ body, currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            try
                            {
                                const createdWorkOrderPart = await this._service.workOrderPartService.CreateWorkOrderPart(body);
                                set.status = 201;
                                set.headers["Location"] = `/work-order-part/${createdWorkOrderPart.id}`;

                                return createdWorkOrderPart;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        body: WorkOrderPartForCreateSchema,
                        detail: { summary: "Create work order part", tags: ["Work Order Parts"] },
                    },
                )
                .put(
                    "/:id",
                    async ({ params, body, currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            try
                            {
                                const id = parseInt(params.id, 10);
                                const updatedWorkOrderPart = await this._service.workOrderPartService.UpdateWorkOrderPart(id, body);
                                set.status = 200;

                                return updatedWorkOrderPart;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: WorkOrderPartIdParamSchema,
                        body: WorkOrderPartForUpdateSchema,
                        detail: { summary: "Update work order part", tags: ["Work Order Parts"] },
                    },
                )
                .delete(
                    "/:id",
                    async ({ params, currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            try
                            {
                                const id = parseInt(params.id, 10);
                                await this._service.workOrderPartService.DeleteWorkOrderPart(id);

                                set.status = 204;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: WorkOrderPartIdParamSchema,
                        detail: { summary: "Delete work order part", tags: ["Work Order Parts"] },
                    },
                )
                .delete(
                    "/collection",
                    async ({ body, currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            try
                            {
                                const ids = body.ids.map((id: string) => parseInt(id, 10));

                                await this._service.workOrderPartService.DeleteWorkOrderPartCollection(ids);

                                set.status = 204;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        body: DeleteCollectionSchema,
                        detail: {
                            summary: "Delete work order parts collection",
                            tags: ["Work Order Parts"],
                        },
                    },
                ),
        );
    }

    private handleError(error: any, set: any)
    {
        if (
            error instanceof WorkOrderPartNotFoundException ||
            error instanceof WorkOrderNotFoundException ||
            error instanceof PartNotFoundException
        )
        {
            set.status = 404;

            return {
                statusCode: 404,
                message: error.message,
                error: "Not Found",
            };
        }

        if (
            error instanceof WorkOrderPartDuplicateBadRequestException ||
            error instanceof WorkOrderPartAlreadyConsumedBadRequestException
        )
        {
            set.status = 400;

            return {
                statusCode: 400,
                message: error.message,
                error: "Bad Request",
            };
        }

        if (error instanceof ForbiddenException)
        {
            set.status = 403;

            return {
                statusCode: 403,
                message: error.message,
                error: "Forbidden",
            };
        }

        set.status = 500;

        return {
            statusCode: 500,
            message: error.message || "An unexpected error occurred",
            error: "Internal Server Error",
            stack:
                process.env.NODE_ENV === "development"
                    ? error.stack
                    : undefined,
        };
    }
}