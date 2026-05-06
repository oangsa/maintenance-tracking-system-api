import { Elysia } from "elysia";
import { IServiceManager } from "@/Applications/Services/Core/IServiceManager";
import { JwtPlugin } from "../../Plugins/JwtPlugin";
import { BadRequestException } from "@/Domains/Exceptions/BadRequestException";
import { ForbiddenException } from "@/Domains/Exceptions/ForbiddenException";
import { RepairRequestParameter } from "@/Domains/RequestFeatures/RepairRequestParameter";
import { RepairRequestItemParameter } from "@/Domains/RequestFeatures/RepairRequestItemParameter";
import { RepairRequestForCreateSchema, RepairRequestForUpdateSchema, RepairRequestIdParamSchema, RepairRequestParameterSchema, RepairRequestItemParameterSchema, DeleteRepairRequestCollectionSchema, RepairRequestItemResponseSchema, RepairRequestStatusLogResponseSchema, RepairRequestItemForCreateSchema, RepairRequestCountGroupByStatusResponseSchema, RepairRequestResponseSchema, MonthlyRepairTrendByProductTypeReportResponseSchema, TopRepairedProductsPerformanceReportResponseSchema } from "../../Validators/RepairRequestSchemaValidation";
import { RepairRequestNotFoundException } from "@/Domains/Exceptions/RepairRequest/RepairRequestNotFoundException";
import { t } from "elysia";
import { WorkOrderParameter } from "@/Domains/RequestFeatures/WorkOrderParameter";
import { WorkOrderResponseSchema, WorkOrderParameterSchema } from "@/Presentations/Validators/WorkOrderSchemaValidation";

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

        app.group("/repair-requests", (app) =>
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
                        response: t.Array(RepairRequestResponseSchema),
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
                        response: RepairRequestResponseSchema,
                        detail: { summary: "Get repair request by ID", tags: ["Repair Requests"] },
                    },
                )
                .post(
                    "/:id/items/search",
                    async ({ params, body, currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            try
                            {
                                const param: RepairRequestItemParameter = {
                                    pageNumber: body.pageNumber ?? 1,
                                    pageSize: body.pageSize ?? 10,
                                    orderBy: body.orderBy as RepairRequestItemParameter["orderBy"],
                                    search: body.search,
                                    searchTerm: body.searchTerm,
                                    deleted: body.deleted ?? false,
                                };

                                const id = parseInt(params.id, 10);
                                const result = await this._service.repairRequestService.GetRepairRequestItems(id, param);

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
                        params: RepairRequestIdParamSchema,
                        body: RepairRequestItemParameterSchema,
                        response: t.Array(RepairRequestItemResponseSchema),
                        detail: { summary: "Search line items for repair request", tags: ["Repair Requests"] },
                    },
                )
                .get(
                    "/:id/audits",
                    async ({ params, currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            try
                            {
                                const id = parseInt(params.id, 10);
                                const result = await this._service.repairRequestService.GetRepairRequestAudits(id);
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
                        response: t.Array(RepairRequestStatusLogResponseSchema),
                        detail: { summary: "Get audit log for repair request", tags: ["Repair Requests"] },
                    },
                )
                .post(
                    "/:id/work-orders/search",
                    async ({ params, body, currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            try
                            {
                                const param = {
                                    pageNumber: body.pageNumber ?? 1,
                                    pageSize: body.pageSize ?? 10,
                                    orderBy: body.orderBy as WorkOrderParameter["orderBy"],
                                    search: body.search,
                                    searchTerm: body.searchTerm,
                                    deleted: body.deleted ?? false,
                                } as WorkOrderParameter;

                                const id = parseInt(params.id, 10);
                                const result = await this._service.workOrderService.GetListWorkOrderByRepairRequestId(id, param);
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
                        params: RepairRequestIdParamSchema,
                        response: t.Array(WorkOrderResponseSchema),
                        body: WorkOrderParameterSchema,
                        detail: { summary: "Get work orders for repair request", tags: ["Repair Requests"] },
                    }
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
                                set.headers["Location"] = `/repair-requests/${created.id}`;

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
                        response: RepairRequestResponseSchema,
                        detail: { summary: "Create repair request", tags: ["Repair Requests"] },
                    },
                )
                .post(
                    "/:id/items",
                    async ({ params, body, currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            try
                            {
                                const created = await this._service.repairRequestService.CreateRepairRequestItems(parseInt(params.id, 10), body);
                                set.status = 201;
                                set.headers["Location"] = `/repair-requests/${params.id}/items`;

                                return created;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        body: t.Array(RepairRequestItemForCreateSchema, { minItems: 1 }),
                        params: RepairRequestIdParamSchema,
                        response: t.Array(RepairRequestItemResponseSchema),
                        detail: { summary: "Create line items for repair request", tags: ["Repair Requests"] },
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
                        response: RepairRequestResponseSchema,
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
                        response: t.Any(),
                        detail: { summary: "Delete repair request", tags: ["Repair Requests"] },
                    },
            )
            .delete("/collection", async ({ currentUser, set, body }) =>
            {
                return this._service.userProvider.run(currentUser!, async () =>
                {
                    try
                    {
                        const ids = body.ids.map((id: string) => parseInt(id, 10));
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
                body: DeleteRepairRequestCollectionSchema,
                response: t.Any(),
                detail: { summary: "Delete repair request collection", tags: ["Repair Requests"] },
            })
            .post(
                "/reports/group-by-status/search",
                async ({ body, currentUser, set }) => {
                    return this._service.userProvider.run(currentUser!, async () => {
                        try {
                            const params: RepairRequestParameter = {
                                pageNumber: body.pageNumber ?? 1,
                                pageSize: body.pageSize ?? 10,
                                orderBy: body.orderBy as RepairRequestParameter["orderBy"],
                                search: body.search,
                                searchTerm: body.searchTerm,
                                deleted: body.deleted ?? false,
                            };

                            const result = await this._service.repairRequestService.GetRepairRequestCountGroupByStatus(params);

                            set.headers["X-Pagination"] = JSON.stringify(result.meta);
                            set.status = 200;

                            return result.items;
                        }
                        catch (error: any) {
                            return this.handleError(error, set);
                        }
                    });
                },
                {
                    body: RepairRequestParameterSchema,
                    response: t.Array(RepairRequestCountGroupByStatusResponseSchema),
                    detail: { summary: "Get repair request count grouped by status", tags: ["Repair Requests"] },
                },
            )

            .post(
                "/reports/top-repaired-products/search",
                async ({ body, currentUser, set }) => {
                    return this._service.userProvider.run(currentUser!, async () => {
                        try {
                                const params: RepairRequestParameter = {
                                    pageNumber: body.pageNumber ?? 1,
                                    pageSize: body.pageSize ?? 10,
                                    orderBy: body.orderBy as RepairRequestParameter["orderBy"],
                                    search: body.search,
                                    searchTerm: body.searchTerm,
                                    deleted: body.deleted ?? false,
                                };

                            const result = await this._service.repairRequestService.GetTopRepairedProductsPerformanceReport(params);

                            set.status = 200;
                            return result;
                        }
                        catch (error: any)
                        {
                            return this.handleError(error, set);
                        }
                    })
                },
                {
                    body: RepairRequestParameterSchema,
                    response: t.Array(TopRepairedProductsPerformanceReportResponseSchema),
                    detail: { summary: "Get top repaired products performance report", tags: ["Repair Requests"] },
                })
                .post(
                    "/reports/monthly-product-type/search",
                    async ({ body, currentUser, set }) => {
                        return this._service.userProvider.run(currentUser!, async () => {
                            try {
                                const params: RepairRequestParameter = {
                                    pageNumber: body.pageNumber ?? 1,
                                    pageSize: body.pageSize ?? 10,
                                    orderBy: body.orderBy as RepairRequestParameter["orderBy"],
                                    search: body.search,
                                    searchTerm: body.searchTerm,
                                    deleted: body.deleted ?? false,
                                };

                                const result = await this._service.repairRequestService.GetMonthlyRepairTrendByProductTypeReport(params);

                                set.status = 200;
                                return result;
                            }
                            catch (error: any) {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        body: RepairRequestParameterSchema,
                        response: t.Array(MonthlyRepairTrendByProductTypeReportResponseSchema),
                        detail: { summary: "Get monthly repair trend by product type report", tags: ["Repair Requests"] },
                    },
                )
        );
    }

    private handleError(error: any, set: any): any
    {
        if (error instanceof BadRequestException)
        {
            set.status = 400;

            return {
                statusCode: 400,
                message: error.message,
                error: "Bad Request",
            };
        }

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
