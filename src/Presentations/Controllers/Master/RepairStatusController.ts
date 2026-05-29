import { Elysia, t } from "elysia";
import { IServiceManager } from "../../../Applications/Services/Core/IServiceManager";
import { JwtPlugin } from "../../Plugins/JwtPlugin";
import { ForbiddenException } from "../../../Domains/Exceptions/ForbiddenException";
import { RepairStatusParameter } from "../../../Domains/RequestFeatures/RepairStatusParameter";
import { RepairStatusForCreateSchema, RepairStatusIdParamSchema, RepairStatusParameterSchema, RepairStatusForUpdateSchema, RepairStatusResponseSchema } from "../../Validators/RepairStatusSchemaValidation";
import { RepairStatusNotFoundException } from "../../../Domains/Exceptions/RepairStatus/RepairStatusNotFoundException";
import { RepairStatusDuplicateBadRequestException } from "../../../Domains/Exceptions/RepairStatus/RepairStatusDuplicateBadRequestException";
import { DeleteCollectionSchema } from "@/Presentations/Validators/UserSchemaValidation";

export class RepairStatusController
{
    private readonly _service: IServiceManager;

    constructor(service: IServiceManager)
    {
        this._service = service;
    }

    public RegisterRoutes(app: Elysia<any>): void
    {
        const { secret } = this._service.configurationManager.jwt;

        app.group("/repair-status", (app) =>
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
                                const params: RepairStatusParameter = {
                                    pageNumber: body.pageNumber ?? 1,
                                    pageSize: body.pageSize ?? 10,
                                    orderBy: body.orderBy as RepairStatusParameter["orderBy"],
                                    search: body.search,
                                    searchTerm: body.searchTerm,
                                    deleted: body.deleted ?? false,
                                };

                                const result = await this._service.repairStatusService.GetListRepairStatus(params);

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
                        body: RepairStatusParameterSchema,
                        response: t.Array(RepairStatusResponseSchema),
                        detail: { summary: "Search repair statuses", tags: ["Repair Status"] },
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
                                const result = await this._service.repairStatusService.GetRepairStatus(id);
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
                        params: RepairStatusIdParamSchema,
                        response: RepairStatusResponseSchema,
                        detail: { summary: "Get repair status by ID", tags: ["Repair Status"] },
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
                                const result = await this._service.repairStatusService.CreateRepairStatus(body);
                                set.status = 201;
                                set.headers["Location"] = `/repair-status/${result.id}`;

                                return result;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        body: RepairStatusForCreateSchema,
                        response: RepairStatusResponseSchema,
                        detail: { summary: "Create repair status", tags: ["Repair Status"] },
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
                                const result = await this._service.repairStatusService.UpdateRepairStatus(id, body);
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
                        params: RepairStatusIdParamSchema,
                        body: RepairStatusForUpdateSchema,
                        response: RepairStatusResponseSchema,
                        detail: { summary: "Update repair status", tags: ["Repair Status"] },
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
                                await this._service.repairStatusService.DeleteRepairStatus(id);

                                set.status = 204;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: RepairStatusIdParamSchema,
                        response: t.Any(),
                        detail: { summary: "Delete repair status", tags: ["Repair Status"] },
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
                
                                    await this._service.repairStatusService.DeleteRepairStatusCollection(ids);
                
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
                            response: t.Any(),
                            detail: {
                                summary: "Delete repair status collection",
                                tags: ["Repair Status"],
                            },
                        },
                    )
                
        );
    }

    private handleError(error: any, set: any)
    {
        if (error instanceof RepairStatusNotFoundException)
        {
            set.status = 404;
            return {
                statusCode: 404,
                message: error.message,
                error: "Not Found",
            };
        }

        if (error instanceof RepairStatusDuplicateBadRequestException)
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
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        };
    }
}
