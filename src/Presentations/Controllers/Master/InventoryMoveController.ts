import { Elysia, t } from "elysia";
import { IServiceManager } from "../../../Applications/Services/Core/IServiceManager";
import { JwtPlugin } from "../../Plugins/JwtPlugin";
import { ForbiddenException } from "../../../Domains/Exceptions/ForbiddenException";
import { InventoryMoveParameter } from "../../../Domains/RequestFeatures/InventoryMoveParameter";
import {
    DeleteInventoryMoveCollectionSchema,
    InventoryMoveForCreateSchema,
    InventoryMoveForUpdateSchema,
    InventoryMoveIdParamSchema,
    InventoryMoveParameterSchema,
    InventoryMoveResponseSchema,
} from "../../Validators/InventoryMoveSchemaValidation";
import { InventoryMoveNotFoundException } from "../../../Domains/Exceptions/InventoryMove/InventoryMoveNotFoundException";
import { InventoryMoveDuplicateBadRequestException } from "../../../Domains/Exceptions/InventoryMove/InventoryMoveDuplicateBadRequestException";

export class InventoryMoveController
{
    private readonly _service: IServiceManager;

    constructor(service: IServiceManager)
    {
        this._service = service;
    }

    public RegisterRoutes(app: Elysia<any>): void
    {
        const { secret } = this._service.configurationManager.jwt;

        app.group("/inventory-move", (app) =>
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
                                const params: InventoryMoveParameter = {
                                    pageNumber: body.pageNumber ?? 1,
                                    pageSize: body.pageSize ?? 10,
                                    orderBy: body.orderBy as InventoryMoveParameter["orderBy"],
                                    search: body.search,
                                    searchTerm: body.searchTerm,
                                    deleted: body.deleted ?? false,
                                };

                                const result = await this._service.inventoryMoveService.GetListInventoryMove(params);

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
                        body: InventoryMoveParameterSchema,
                        response: t.Array(InventoryMoveResponseSchema),
                        detail: { summary: "Search inventory moves", tags: ["Inventory Moves"] },
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
                                const inventoryMove = await this._service.inventoryMoveService.GetInventoryMove(id);
                                set.status = 200;

                                return inventoryMove;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: InventoryMoveIdParamSchema,
                        response: InventoryMoveResponseSchema,
                        detail: { summary: "Get inventory move by ID", tags: ["Inventory Moves"] },
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
                                const createdInventoryMove = await this._service.inventoryMoveService.CreateInventoryMove(body);
                                set.status = 201;
                                set.headers["Location"] = `/inventory-move/${createdInventoryMove.id}`;

                                return createdInventoryMove;
                            }
                            catch (error: any)
                            {
                               return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        body: InventoryMoveForCreateSchema,
                        response: InventoryMoveResponseSchema,
                        detail: { summary: "Create inventory move", tags: ["Inventory Moves"] },
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
                                const updatedInventoryMove = await this._service.inventoryMoveService.UpdateInventoryMove(id, body);
                                set.status = 200;

                                return updatedInventoryMove;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: InventoryMoveIdParamSchema,
                        body: InventoryMoveForUpdateSchema,
                        response: InventoryMoveResponseSchema,
                        detail: { summary: "Update inventory move", tags: ["Inventory Moves"] },
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
                                await this._service.inventoryMoveService.DeleteInventoryMove(id);
                                
                                set.status = 204;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                            
                        });
                    },
                    
                    {
                        params: InventoryMoveIdParamSchema,
                        response: t.Any(),
                        detail: { summary: "Delete inventory move", tags: ["Inventory Moves"] },
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
                                await this._service.inventoryMoveService.DeleteInventoryMoveCollection(ids);
                                
                                set.status = 204;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        body: DeleteInventoryMoveCollectionSchema,
                        response: t.Any(),
                        detail: { 
                            summary: "Delete inventory move collection", 
                            tags: ["Inventory Moves"] 
                        },
                    },
                )

                .post(
                    "/:id/reverse",
                    async ({ params, body, currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            try
                            {
                                const id = parseInt(params.id, 10);
                                const reversedInventoryMove = await this._service.inventoryMoveService.ReverseInventoryMove(id, body);
                                set.status = 201;
                                return reversedInventoryMove;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: InventoryMoveIdParamSchema,
                        body: InventoryMoveForCreateSchema,
                        response: InventoryMoveResponseSchema,
                        detail: { summary: "Reverse inventory move", tags: ["Inventory Moves"] },
                    },
                )
        );
    }

    private handleError(error: any, set: any)
    {
        if (error instanceof InventoryMoveNotFoundException)
        {
            set.status = 404;
            return { 
                statusCode: 404, 
                message: error.message, 
                error: "Not Found" 
            };
        }

        if (error instanceof InventoryMoveDuplicateBadRequestException)
        {
            set.status = 400;
            return { 
                statusCode: 400, 
                message: error.message, 
                error: "Bad Request" 
            };
        }

        if (error instanceof ForbiddenException)
        {
            set.status = 403;
            return { 
                statusCode: 403, 
                message: error.message, 
                error: "Forbidden" 
            };
        }

        if (error.message && (error.message.includes("XOR") || error.message.includes("direction"))) {
            set.status = 400;
            return {
                statusCode: 400,
                message: error.message,
                error: "Bad Request (XOR Validation Failed)"
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
