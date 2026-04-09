import { Elysia } from "elysia";
import { IServiceManager } from "../../../Applications/Services/Core/IServiceManager";
import { JwtPlugin } from "../../Plugins/JwtPlugin";
import { ForbiddenException } from "../../../Domains/Exceptions/ForbiddenException";
import { RepairRequestItemStatusParameter } from "../../../Domains/RequestFeatures/RepairRequestItemStatusParameter";
import {
    DeleteRepairRequestItemStatusCollectionSchema,
    RepairRequestItemStatusForCreateSchema,
    RepairRequestItemStatusForUpdateSchema,
    RepairRequestItemStatusIdParamSchema,
    RepairRequestItemStatusParameterSchema,
} from "../../Validators/RepairRequestItemStatusSchemaValidation";
import { RepairRequestItemStatusNotFoundException } from "../../../Domains/Exceptions/RepairRequest/RepairRequestItemStatusNotFoundException";
import { RepairRequestItemStatusDuplicateBadRequestException } from "../../../Domains/Exceptions/RepairRequest/RepairRequestItemStatusDuplicateBadRequestException";

export class RepairRequestItemStatusController
{
    private readonly _service: IServiceManager;

    constructor(service: IServiceManager)
    {
        this._service = service;
    }

    public RegisterRoutes(app: Elysia<any>): void
    {
        const { secret } = this._service.configurationManager.jwt;

        app.group("/repair-request-item-status", (app) =>
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
                                const params: RepairRequestItemStatusParameter = {
                                    pageNumber: body.pageNumber ?? 1,
                                    pageSize: body.pageSize ?? 10,
                                    orderBy: body.orderBy as RepairRequestItemStatusParameter["orderBy"],
                                    search: body.search,
                                    searchTerm: body.searchTerm,
                                    deleted: body.deleted ?? false,
                                };

                                const result = await this._service.repairRequestItemStatusService.GetListRepairRequestItemStatus(params);

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
                        body: RepairRequestItemStatusParameterSchema,
                        detail: { summary: "Search repair request item statuses", tags: ["Repair Request Item Statuses"] },
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
                                const repairRequestItemStatus = await this._service.repairRequestItemStatusService.GetRepairRequestItemStatus(id);
                                set.status = 200;

                                return repairRequestItemStatus;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: RepairRequestItemStatusIdParamSchema,
                        detail: { summary: "Get repair request item status by ID", tags: ["Repair Request Item Statuses"] },
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
                                const createdRepairRequestItemStatus = await this._service.repairRequestItemStatusService.CreateRepairRequestItemStatus(body);
                                set.status = 201;
                                set.headers["Location"] = `/repair-request-item-status/${createdRepairRequestItemStatus.id}`;

                                return createdRepairRequestItemStatus;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        body: RepairRequestItemStatusForCreateSchema,
                        detail: { summary: "Create repair request item status", tags: ["Repair Request Item Statuses"] },
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
                                const updatedRepairRequestItemStatus = await this._service.repairRequestItemStatusService.UpdateRepairRequestItemStatus(id, body);
                                set.status = 200;

                                return updatedRepairRequestItemStatus;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: RepairRequestItemStatusIdParamSchema,
                        body: RepairRequestItemStatusForUpdateSchema,
                        detail: { summary: "Update repair request item status", tags: ["Repair Request Item Statuses"] },
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
                                await this._service.repairRequestItemStatusService.DeleteRepairRequestItemStatus(id);

                                set.status = 204;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: RepairRequestItemStatusIdParamSchema,
                        detail: { summary: "Delete repair request item status", tags: ["Repair Request Item Statuses"] },
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

                                await this._service.repairRequestItemStatusService.DeleteRepairRequestItemStatusCollection(ids);

                                set.status = 204;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        body: DeleteRepairRequestItemStatusCollectionSchema,
                        detail: {
                            summary: "Delete repair request item status collection",
                            tags: ["Repair Request Item Statuses"],
                        },
                    },
                ),
        );
    }

    private handleError(error: any, set: any)
    {
        if (error instanceof RepairRequestItemStatusNotFoundException)
        {
            set.status = 404;

            return {
                statusCode: 404,
                message: error.message,
                error: "Not Found",
            };
        }

        if (error instanceof RepairRequestItemStatusDuplicateBadRequestException)
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
