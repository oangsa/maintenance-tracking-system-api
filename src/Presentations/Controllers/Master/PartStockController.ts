import { Elysia } from "elysia";
import { IServiceManager } from "../../../Applications/Services/Core/IServiceManager";
import { JwtPlugin } from "../../Plugins/JwtPlugin";
import { ForbiddenException } from "../../../Domains/Exceptions/ForbiddenException";
import { PartIdParamSchema, ReceiveStockSchema, ConsumeStockSchema, AdjustStockSchema } from "@/Presentations/Validators/PartStockSchemaValidation";
import { PartNotFoundException } from "../../../Domains/Exceptions/Part/PartNotFoundException";
import { MessageResponseSchema } from "@/Presentations/Validators/AuthSchemaValidation";

export class PartStockController
{
    private readonly _service: IServiceManager;

    constructor(service: IServiceManager)
    {
        this._service = service;
    }

    public RegisterRoutes(app: Elysia<any>): void
    {
        const { secret } = this._service.configurationManager.jwt;

        app.group("/part/:id", (app) =>
            app
                .use(JwtPlugin(secret, this._service.authService))
                .post(
                    "/receive-stock",
                    async ({ body, params, currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            try
                            {
                                const partId = parseInt(params.id,10);
                                const movePayload = {
                                    reason: "buy" as const,
                                    remark: body.remark,
                                    inventoryMoveItems: [{
                                        partId : partId,
                                        quantityIn: body.quantity,
                                        quantityOut: 0,
                                        note: body.note
                                    }],
                                };


                                await this._service.inventoryMoveService.CreateInventoryMove(movePayload);

                                set.status = 200;
                                return { message: "Stock received successfully" };
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: PartIdParamSchema,
                        body: ReceiveStockSchema,
                        response: MessageResponseSchema,
                        detail: { summary: "Receive part stock", tags: ["Part Stock"] },
                    },
                )
                .post(
                    "/consume-stock",
                    async ({ body, params, currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            try
                            {
                                const partId = parseInt(params.id, 10);
                                if (body.workOrderPartId) {
                                    const workOrderPart = await this._service.workOrderPartService.GetWorkOrderPart(body.workOrderPartId);
                                    if (body.quantity !== workOrderPart.quantity) {
                                        set.status = 400;
                                        return {
                                            statusCode: 400,
                                            message: `Quantity mismatch: Work order requires ${workOrderPart.quantity}, but ${body.quantity} was requested.`,
                                            error: "Bad Request"
                                        };
                                    }
                                    
                                    const isAlreadyConsumed = await this._service.inventoryMoveService.CheckIfWorkOrderPartConsumed(body.workOrderPartId);
                                    if (isAlreadyConsumed) {
                                        set.status = 400;
                                        return {
                                            statusCode: 400,
                                            message: `This work order part has already been consumed.`,
                                            error: "Bad Request"
                                        };
                                    }
                                }
                                const movePayload = {
                                    reason: "use" as const,
                                    remark: body.remark,
                                    inventoryMoveItems: [{
                                        partId : partId,
                                        quantityIn: 0,
                                        quantityOut: body.quantity,
                                        workOrderPartId: body.workOrderPartId,
                                        note: body.note
                                    }],
                                };

                                await this._service.inventoryMoveService.CreateInventoryMove(movePayload);

                                set.status = 200;
                                return { message: "Stock consumed successfully" };
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: PartIdParamSchema,
                        body: ConsumeStockSchema,
                        response: MessageResponseSchema,
                        detail: { summary: "Consume part stock", tags: ["Part Stock"] },
                    },
                )
                .post(
                    "/adjust-stock",
                    async ({ body, params, currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            try
                            {
                                const partId = parseInt(params.id, 10);
                                const isAdding = body.direction === "in";
                                const moveReason = body.reason || "adjust";
                                const movePayload = {
                                    reason: moveReason as any,
                                    remark: body.remark,
                                    inventoryMoveItems: [{
                                        partId : partId,
                                        quantityIn: isAdding ? body.quantity : 0,
                                        quantityOut: !isAdding ? body.quantity : 0,
                                        note: body.note
                                    }],
                                };

                                await this._service.inventoryMoveService.CreateInventoryMove(movePayload);

                                set.status = 200;
                                return { message: "Stock adjusted successfully" };
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: PartIdParamSchema,
                        body: AdjustStockSchema,
                        response: MessageResponseSchema,
                        detail: { summary: "Adjust part stock", tags: ["Part Stock"] },
                },
            ),  
        );     
    }

        private handleError(error: any, set: any)
        {
            if (error instanceof PartNotFoundException)
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
                stack:
                    process.env.NODE_ENV === "development"
                        ? error.stack
                        : undefined,
            };
        }
    
}               
