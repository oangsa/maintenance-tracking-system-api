import { Elysia } from "elysia";
import { IServiceManager } from "../../../Applications/Services/Core/IServiceManager";
import { JwtPlugin } from "../../Plugins/JwtPlugin";
import { UserNotFoundException } from "../../../Domains/Exceptions/User/UserNotFoundException";
import { UserDuplicateBadRequestException } from "../../../Domains/Exceptions/User/UserDuplicateBadRequestException";
import { ForbiddenException } from "../../../Domains/Exceptions/ForbiddenException";
import { UserParameter } from "../../../Domains/RequestFeatures/UserParameter";
import { DeleteCollectionSchema, UserForCreateSchema, UserForUpdateSchema, UserIdParamSchema, UserParameterSchema } from "../../Validators/UserSchemaValidation";

export class UserController
{
    private readonly _service: IServiceManager;

    constructor(service: IServiceManager)
    {
        this._service = service;
    }

    public RegisterRoutes( app: Elysia<any>): void
    {
        const { secret } = this._service.configurationManager.jwt;

        app.group("/users", (app) =>
            app
                .use(JwtPlugin(secret, this._service.authService))
                .get(
                    "/me",
                    async ({ currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            try
                            {
                                const user = await this._service.userService.GetUser(currentUser!.userId);
                                set.status = 200;

                                return user;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        detail: { summary: "Get current user profile", tags: ["Users"] },
                    },
                )
                .post("/search",
                    async ({ body, currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            try
                            {
                                const params: UserParameter = {
                                    pageNumber: body.pageNumber ?? 1,
                                    pageSize: body.pageSize ?? 10,
                                    orderBy: body.orderBy as UserParameter["orderBy"],
                                    search: body.search,
                                    searchTerm: body.searchTerm,
                                    deleted: body.deleted ?? false,
                                    excludeId: currentUser!.userId,
                                };

                                const result = await this._service.userService.GetListUser(params);

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
                        body: UserParameterSchema,
                        detail: { summary: "Search users", tags: ["Users"] },
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
                                const user = await this._service.userService.GetUser(id);
                                set.status = 200;

                                return user;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: UserIdParamSchema,
                        detail: { summary: "Get user by ID", tags: ["Users"] },
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
                                const createdUser = await this._service.userService.CreateUser(body);
                                set.status = 201;
                                set.headers["Location"] = `/users/${createdUser.id}`;

                                return createdUser;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        body: UserForCreateSchema,
                        detail: { summary: "Create user", tags: ["Users"] },
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
                                const updatedUser = await this._service.userService.UpdateUser(id, body);
                                set.status = 200;

                                return updatedUser;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: UserIdParamSchema,
                        body: UserForUpdateSchema,
                        detail: { summary: "Update user", tags: ["Users"] },
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
                                await this._service.userService.DeleteUser(id);

                                set.status = 204;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: UserIdParamSchema,
                        detail: { summary: "Delete user", tags: ["Users"] },
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

                                await this._service.userService.DeleteUserCollection(ids);

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
                            summary: "Delete user collection",
                            tags: ["Users"],
                        },
                    },
                ),
        );
    }

    private handleError(error: any, set: any)
    {
        if (error instanceof UserNotFoundException)
        {
            set.status = 404;

            return {
                statusCode: 404,
                message: error.message,
                error: "Not Found",
            };
        }

        if (error instanceof UserDuplicateBadRequestException)
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
