import { Elysia } from "elysia";
import { IServiceManager } from "../../../Applications/Services/Core/IServiceManager";
import { JwtPlugin } from "../../Plugins/JwtPlugin";
import { ForbiddenException } from "../../../Domains/Exceptions/ForbiddenException";
import { ProductParameter } from "../../../Domains/RequestFeatures/ProductParameter";
import { ProductForCreateSchema, ProductIdParamSchema, ProductParameterSchema, DeleteCollectionSchema, ProductForUpdateSchema } from "../../Validators/ProductSchemaValidation";
import { ProductNotFoundException } from "../../../Domains/Exceptions/Product/ProductNotFoundException";
import { ProductDuplicateBadRequestException } from "../../../Domains/Exceptions/Product/ProductDuplicateBadRequestException";

export class ProductController
{
    private readonly _service: IServiceManager;

    constructor(service: IServiceManager)
    {
        this._service = service;
    }

    public RegisterRoutes(app: Elysia<any>): void
    {
        const { secret } = this._service.configurationManager.jwt;

        app.group("/product", (app) =>
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
                                const params: ProductParameter = {
                                    pageNumber: body.pageNumber ?? 1,
                                    pageSize: body.pageSize ?? 10,
                                    orderBy: body.orderBy as ProductParameter["orderBy"],
                                    search: body.search,
                                    searchTerm: body.searchTerm,
                                    deleted: body.deleted ?? false,
                                };

                                const result = await this._service.productService.GetListProduct(params);

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
                        body: ProductParameterSchema,
                        detail: { summary: "Search products", tags: ["Products"] },
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
                                const product = await this._service.productService.GetProduct(id);
                                set.status = 200;

                                return product;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: ProductIdParamSchema,
                        detail: { summary: "Get product by ID", tags: ["Products"] },
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
                                const createdProduct = await this._service.productService.CreateProduct(body);
                                set.status = 201;
                                set.headers["Location"] = `/product/${createdProduct.id}`;

                                return createdProduct;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        body: ProductForCreateSchema,
                        detail: { summary: "Create product", tags: ["Products"] },
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
                                const updatedProduct = await this._service.productService.UpdateProduct(id, body);
                                set.status = 200;

                                return updatedProduct;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: ProductIdParamSchema,
                        body: ProductForUpdateSchema,
                        detail: { summary: "Update product", tags: ["Products"] },
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
                                await this._service.productService.DeleteProduct(id);
                                set.status = 204;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: ProductIdParamSchema,
                        detail: { summary: "Delete product", tags: ["Products"] },
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

                                await this._service.productService.DeleteProductCollection(ids);

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
                            summary: "Delete products collection", tags: ["Products"],
                        },
                    },
                ),
        );
    }

    private handleError(error: any, set: any)
    {
        if (error instanceof ProductNotFoundException)
        {
            set.status = 404;

            return {
                statusCode: 404,
                message: error.message,
                error: "Not Found",
            };
        }

        if (error instanceof ProductDuplicateBadRequestException)
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
