import { Elysia } from "elysia";
import { IServiceManager } from "../../../Applications/Services/Core/IServiceManager";
import { JwtPlugin } from "../../Plugins/JwtPlugin";
import { ForbiddenException } from "../../../Domains/Exceptions/ForbiddenException";
import { WorkTaskParameter } from "../../../Domains/RequestFeatures/WorkTaskParameter";
import { WorkTaskForCreateSchema, WorkTaskIdParamSchema, WorkTaskParameterSchema, DeleteWorkTaskCollectionSchema, WorkTaskForUpdateSchema,WorkTaskAssignSchema } from "../../Validators/WorkTaskSchemaValidation";
import { WorkTaskNotFoundException } from "../../../Domains/Exceptions/WorkTask/WorkTaskNotFoundException";
import { WorkTaskAlreadyCompletedBadRequestException } from "../../../Domains/Exceptions/WorkTask/WorkTaskAlreadyCompletedBadRequestException";
import { WorkTaskAlreadyExistsBadRequestException } from "@/Domains/Exceptions/WorkTask/WorkTaskAlreadyExistsBadRequestException";
import { UsersNotInSameDepartmentBadRequestException } from "@/Domains/Exceptions/WorkTask/UsersNotInSameDepartmentBadRequestException";


export class WorkTaskController
{
    private readonly _service: IServiceManager;

    constructor(service: IServiceManager)
    {
        this._service = service;
    }

    public RegisterRoutes( app: Elysia<any>): void
    {
        const { secret } = this._service.configurationManager.jwt;

        app.group("/work-task", (app) =>
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
                                const params: WorkTaskParameter = {
                                    pageNumber: body.pageNumber ?? 1,
                                    pageSize: body.pageSize ?? 10,
                                    orderBy: body.orderBy as WorkTaskParameter["orderBy"],
                                    search: body.search,
                                    searchTerm: body.searchTerm,
                                    workOrderId: (body as any).workOrderId,
                                    assigneeId: (body as any).assigneeId,
                                };

                                const result = await this._service.workTaskService.GetListWorkTask(params);

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
                        body: WorkTaskParameterSchema,
                        detail: { summary: "Search work tasks", tags: ["WorkTasks"] },
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
                                const workTask = await this._service.workTaskService.GetWorkTask(id);
                                set.status = 200;

                                return workTask;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: WorkTaskIdParamSchema,
                        detail: { summary: "Get work task by ID", tags: ["WorkTasks"] },
                    },
                )
                .get(
                    "/:id/assignment-history",
                    async ({ params, currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            try
                            {
                                const id = parseInt(params.id, 10);
                                const history = await this._service.workTaskService.GetAssignmentHistory(id);
                                set.status = 200;

                                return history;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: WorkTaskIdParamSchema,
                        detail: { summary: "Get work task assignment history by ID", tags: ["WorkTasks"] },
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
                                const createdWorkTask = await this._service.workTaskService.CreateWorkTask(body);
                                set.status = 201;
                                set.headers["Location"] = `/work-tasks/${createdWorkTask.id}`;

                                return createdWorkTask;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        body: WorkTaskForCreateSchema,
                        detail: { summary: "Create work task", tags: ["WorkTasks"] },
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
                                const updatedWorkTask = await this._service.workTaskService.UpdateWorkTask(id, body);
                                set.status = 200;

                                return updatedWorkTask;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: WorkTaskIdParamSchema,
                        body: WorkTaskForUpdateSchema,
                        detail: { summary: "Update work task", tags: ["WorkTasks"] },
                    },
                )

                .post(
                    "/:id/assign",
                    async ({ params, body, currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            try
                            {
                                const id = parseInt(params.id, 10);
                                const updatedWorkTask = await this._service.workTaskService.AssignWorkTask(id, body);
                                set.status = 200;

                                return updatedWorkTask;
        
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: WorkTaskIdParamSchema,
                        body: WorkTaskAssignSchema,
                        detail: { summary: "Assign or reassign work task to a user", tags: ["WorkTasks"] },
                    },
                )

                .post(
                    "/:id/unassign",
                    async ({ params, currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            try
                            {
                                const id = parseInt(params.id, 10);
                                const updatedWorkTask = await this._service.workTaskService.UnassignWorkTask(id);
                                set.status = 200;

                                return updatedWorkTask;
        
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: WorkTaskIdParamSchema,
                        detail: { summary: "Unassign work task", tags: ["WorkTasks"] },
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
                                await this._service.workTaskService.DeleteWorkTask(id);

                                set.status = 204;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: WorkTaskIdParamSchema,
                        detail: { summary: "Delete work task", tags: ["WorkTasks"] },
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

                                await this._service.workTaskService.DeleteWorkTaskCollection(ids);

                                set.status = 204;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        body: DeleteWorkTaskCollectionSchema,
                        detail: {
                            summary: "Delete work tasks collection",
                            tags: ["WorkTasks"],
                        },
                    },
                ),
        );
    }

    private handleError(error: any, set: any)
    {
        if (error instanceof WorkTaskNotFoundException)
        {
            set.status = 404;

            return {
                statusCode: 404,
                message: error.message,
                error: "Not Found",
            };
        }

        if (error instanceof WorkTaskAlreadyCompletedBadRequestException)
        {
            set.status = 400;

            return {
                statusCode: 400,
                message: error.message,
                error: "Bad Request",
            };
        }

        if (error instanceof WorkTaskAlreadyExistsBadRequestException || error instanceof UsersNotInSameDepartmentBadRequestException)
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
