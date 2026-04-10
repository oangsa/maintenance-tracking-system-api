import { Elysia } from "elysia";
import { IServiceManager } from "@/Applications/Services/Core/IServiceManager";
import { JwtPlugin } from "../../Plugins/JwtPlugin";
import { ForbiddenException } from "@/Domains/Exceptions/ForbiddenException";
import { RepairRequestParameter } from "@/Domains/RequestFeatures/RepairRequestParameter";
import { RepairRequestForCreateSchema, RepairRequestForUpdateSchema, RepairRequestIdParamSchema, RepairRequestParameterSchema, DeleteRepairRequestCollectionSchema, } from "../../Validators/RepairRequestSchemaValidation";
import { RepairRequestNotFoundException } from "@/Domains/Exceptions/RepairRequest/RepairRequestNotFoundException";

export class RepairRequestController
{
    private readonly _service: IServiceManager;

    constructor(service: IServiceManager)
    {
        this._service = service;
    }

    public RegisterRoutes(app: Elysia<any>): void
    {
        const { secret } = this._service.configurationManager.jwt;

        app.group("/repair-request", (app) =>
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
                                const params: RepairRequestParameter = {
                                    pageNumber: body.pageNumber ?? 1,
                                    pageSize: body.pageSize ?? 10,
                                    orderBy: body.orderBy as RepairRequestParameter["orderBy"],
                                    search: body.search,
                                    searchTerm: body.searchTerm,
                                    deleted: body.deleted ?? false,
                                };

                                const result = await this._service.repairRequestService.GetListRepairRequest(params);

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
                        body: RepairRequestParameterSchema,
                        detail: { summary: "Search repair requests", tags: ["Repair Requests"] },
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
                                const result = await this._service.repairRequestService.GetRepairRequest(id);
                                set.status = 200;

                                return result;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: RepairRequestIdParamSchema,
                        detail: { summary: "Get repair request by ID", tags: ["Repair Requests"] },
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
                                const created = await this._service.repairRequestService.CreateRepairRequest(body);
                                set.status = 201;
                                set.headers["Location"] = `/repair-request/${created.id}`;

                                return created;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        body: RepairRequestForCreateSchema,
                        detail: { summary: "Create repair request", tags: ["Repair Requests"] },
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
                                const result = await this._service.repairRequestService.UpdateRepairRequest(id, body);
                                set.status = 200;

                                return result;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: RepairRequestIdParamSchema,
                        body: RepairRequestForUpdateSchema,
                        detail: { summary: "Update repair request", tags: ["Repair Requests"] },
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
                                await this._service.repairRequestService.DeleteRepairRequest(id);

                                set.status = 204;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: RepairRequestIdParamSchema,
                        detail: { summary: "Delete repair request", tags: ["Repair Requests"] },
                    },
            )
            .delete("collection", async ({ currentUser, set, params }) =>
            {
                return this._service.userProvider.run(currentUser!, async () =>
                {
                    try
                    {
                        const ids = params.ids.map((id: string) => parseInt(id, 10));
                        await this._service.repairRequestService.DeleteRepairRequestCollection(ids);

                        set.status = 204;
                    }
                    catch (error: any)
                    {
                        return this.handleError(error, set);
                    }
                });
            },
            {
                params: DeleteRepairRequestCollectionSchema,
                detail: { summary: "Delete repair request collection", tags: ["Repair Requests"] },
            })
        );
    }

    private handleError(error: any, set: any)
    {
        if (error instanceof RepairRequestNotFoundException)
        {
            set.status = 404;

            return {
                statusCode: 404,
                message: error.message,
                error: "Not Found",
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
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        };
    }
}
