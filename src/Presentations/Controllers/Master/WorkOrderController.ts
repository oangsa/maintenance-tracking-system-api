import { Elysia } from "elysia";
import { IServiceManager } from "../../../Applications/Services/Core/IServiceManager";
import { JwtPlugin } from "../../Plugins/JwtPlugin";
import { ForbiddenException } from "../../../Domains/Exceptions/ForbiddenException";
import { WorkOrderParameter } from "../../../Domains/RequestFeatures/WorkOrderParameter";
import { WorkOrderForCreateSchema, WorkOrderForUpdateSchema, WorkOrderIdParamSchema, WorkOrderParameterSchema, DeleteCollectionSchema } from "../../../Presentations/Validators/WorkOrderSchemaValidation";
import { WorkOrderNotFoundException } from "../../../Domains/Exceptions/WorkOrder/WorkOrderNotFoundException";
import { WorkOrderSequenceDuplicateException } from "../../../Domains/Exceptions/WorkOrder/WorkOrderSequenceDuplicateException";


export class WorkOrderController
{
    private readonly _service: IServiceManager;

    constructor(service: IServiceManager)
    {
        this._service = service;
    }

    public RegisterRoutes( app: Elysia<any>): void
    {
        const { secret } = this._service.configurationManager.jwt;

        app.group("/work-order", (app) =>
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
                                const params: WorkOrderParameter = {
                                    pageNumber: body.pageNumber ?? 1,
                                    pageSize: body.pageSize ?? 10,
                                    orderBy: body.orderBy as WorkOrderParameter["orderBy"],
                                    search: body.search,
                                    searchTerm: body.searchTerm,
                                };

                                const result = await this._service.workOrderService.GetListWorkOrder(params);

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
                        body: WorkOrderParameterSchema,
                        detail: { summary: "Search work orders", tags: ["WorkOrders"] },
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
                                const workOrder = await this._service.workOrderService.GetWorkOrder(id);
                                set.status = 200;

                                return workOrder;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: WorkOrderIdParamSchema,
                        detail: { summary: "Get work order by ID", tags: ["WorkOrders"] },
                    },
                )
                .post(
                    "/",
                    async ({ body, currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            console.log(body);
                            try
                            {
                                const createdWorkOrder = await this._service.workOrderService.CreateWorkOrder(body);
                                set.status = 201;
                                set.headers["Location"] = `/work-order/${createdWorkOrder.id}`;

                                return createdWorkOrder;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        body: WorkOrderForCreateSchema,
                        detail: { summary: "Create work order", tags: ["WorkOrders"] },
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
                                const updatedWorkOrder = await this._service.workOrderService.UpdateWorkOrder(id, body);
                                set.status = 200;

                                return updatedWorkOrder;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: WorkOrderIdParamSchema,
                        body: WorkOrderForUpdateSchema,
                        detail: { summary: "Update work order", tags: ["WorkOrders"] },
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
                                await this._service.workOrderService.DeleteWorkOrder(id);

                                set.status = 204;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: WorkOrderIdParamSchema,
                        detail: { summary: "Delete work order", tags: ["WorkOrders"] },
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

                                await this._service.workOrderService.DeleteWorkOrderCollection(ids);

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
                            summary: "Delete work order collection",
                            tags: ["WorkOrders"],
                        },
                    },
                )
                

        );
    }

    private handleError(error: any, set: any)
    {
        if (error instanceof WorkOrderNotFoundException)
        {
            set.status = 404;

            return {
                statusCode: 404,
                message: error.message,
                error: "Not Found",
            };
        }

        if (error instanceof WorkOrderSequenceDuplicateException)
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
