import { Elysia, t } from "elysia";
import { IServiceManager } from "../../../Applications/Services/Core/IServiceManager";
import { JwtPlugin } from "../../Plugins/JwtPlugin";
import { ForbiddenException } from "../../../Domains/Exceptions/ForbiddenException";
import { ProductTypeParameter } from "../../../Domains/RequestFeatures/ProductTypeParameter";
import { ProductTypeForCreateSchema, ProductTypeIdParamSchema, ProductTypeParameterSchema, DeleteCollectionSchema, ProductTypeForUpdateSchema, ProductTypeResponseSchema} from "../../Validators/ProductTypeSchemaValidation";
import { ProductTypeNotFoundException } from "../../../Domains/Exceptions/ProductType/ProductTypeNotFoundException";
import { ProductTypeDuplicateBadRequestException } from "../../../Domains/Exceptions/ProductType/ProductTypeDuplicateBadRequestException";
import { ProductResponseSchema } from "@/Presentations/Validators/ProductSchemaValidation";
import { PartResponseSchema } from "@/Presentations/Validators/PartSchemaValidation";

export class ProductTypeController
{
    private readonly _service: IServiceManager;

    constructor(service: IServiceManager)
    {
        this._service = service;
    }

    public RegisterRoutes( app: Elysia<any>): void
    {
        const { secret } = this._service.configurationManager.jwt;

        app.group("/product-type", (app) =>
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
                                const params: ProductTypeParameter = {
                                    pageNumber: body.pageNumber ?? 1,
                                    pageSize: body.pageSize ?? 10,
                                    orderBy: body.orderBy as ProductTypeParameter["orderBy"],
                                    search: body.search,
                                    searchTerm: body.searchTerm,
                                    deleted: body.deleted ?? false,
                                };

                                const result = await this._service.productTypeService.GetListProductType(params);

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
                        body: ProductTypeParameterSchema,
                        response: t.Array(ProductTypeResponseSchema),
                        detail: { summary: "Search product types", tags: ["Product Types"] },
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
                                const productType = await this._service.productTypeService.GetProductType(id);
                                set.status = 200;

                                return productType;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: ProductTypeIdParamSchema,
                        response: ProductTypeResponseSchema,
                        detail: { summary: "Get product type by ID", tags: ["Product Types"] },
                    },
                )
                .get(
                    "/:id/products",
                    async ({ params, currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            try
                            {
                                const id = parseInt(params.id, 10);
                                const products = await this._service.productTypeService.GetProductsByProductTypeId(id);
                                set.status = 200;

                                return products;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: ProductTypeIdParamSchema,
                        response: t.Array(ProductResponseSchema),
                        detail: { summary: "Get products by product type ID", tags: ["Product Types"] },
                    },
                )
                .get(
                    "/:id/parts",
                    async ({ params, currentUser, set }) =>
                    {
                        return this._service.userProvider.run(currentUser!, async () =>
                        {
                            try
                            {
                                const id = parseInt(params.id, 10);
                                const parts = await this._service.productTypeService.GetPartsByProductTypeId(id);
                                set.status = 200;

                                return parts;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: ProductTypeIdParamSchema,
                        response: t.Array(PartResponseSchema),
                        detail: { summary: "Get parts by product type ID", tags: ["Product Types"] },
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
                                const createdProductType = await this._service.productTypeService.CreateProductType(body);
                                set.status = 201;
                                set.headers["Location"] = `/product-type/${createdProductType.id}`;

                                return createdProductType;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        body: ProductTypeForCreateSchema,
                        response: ProductTypeResponseSchema,
                        detail: { summary: "Create product type", tags: ["Product Types"] },
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
                                const updatedProductType = await this._service.productTypeService.UpdateProductType(id, body);
                                set.status = 200;

                                return updatedProductType;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: ProductTypeIdParamSchema,
                        body: ProductTypeForUpdateSchema,
                        response: ProductTypeResponseSchema,
                        detail: { summary: "Update product type", tags: ["Product Types"] },
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
                                await this._service.productTypeService.DeleteProductType(id);

                                set.status = 204;
                            }
                            catch (error: any)
                            {
                                return this.handleError(error, set);
                            }
                        });
                    },
                    {
                        params: ProductTypeIdParamSchema,
                        response: t.Any(),
                        detail: { summary: "Delete product type", tags: ["Product Types"] },
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

                                await this._service.productTypeService.DeleteProductTypeCollection(ids);

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
                            summary: "Delete product types collection",
                            tags: ["Product Types"],
                        },
                    },
                ),
        );
    }

    private handleError(error: any, set: any)
    {
        if (error instanceof ProductTypeNotFoundException)
        {
            set.status = 404;

            return {
                statusCode: 404,
                message: error.message,
                error: "Not Found",
            };
        }

        if (error instanceof ProductTypeDuplicateBadRequestException)
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
