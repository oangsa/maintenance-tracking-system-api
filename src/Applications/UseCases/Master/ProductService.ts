import { ProductDto } from "../../DataTransferObjects/Product/ProductDto";
import { ProductForCreateDto } from "../../DataTransferObjects/Product/ProductForCreateDto";
import { ProductForUpdateDto } from "../../DataTransferObjects/Product/ProductForUpdateDto";
import { ProductParameter } from "../../../Domains/RequestFeatures/ProductParameter";
import { PagedResult } from "../../../Domains/RequestFeatures/Core/PageResult";
import { IProductService } from "@/Applications/Services/IProductService";
import { IRepositoryManager } from "../../../Domains/Repositories/Core/IRepositoryManager";
import { IMapperManager } from "../../Mappers/Core/MapperManager";
import { IUserProvider } from "../../Providers/UserProvider";
import { ICoreAdapterManager } from "../CoreAdapterManager";
import { ProductNotFoundException } from "../../../Domains/Exceptions/Product/ProductNotFoundException";
import { Product } from "../../../Infrastructures/Entities/Master/Product";
import { ProductDuplicateBadRequestException } from "../../../Domains/Exceptions/Product/ProductDuplicateBadRequestException";
import { RoleAuthorizationGuard } from "../../../Shared/Utilities/Authentication/RoleAuthorizationGuard";
import { Role } from "../../../Shared/Enums/Role";

export class ProductService implements IProductService
{
    private readonly _repositoryManager: IRepositoryManager;
    private readonly _mapperManager: IMapperManager;
    private readonly _userProvider: IUserProvider;

    constructor(coreAdapterManager: ICoreAdapterManager, mapperManager: IMapperManager, userProvider: IUserProvider)
    {
        this._repositoryManager = coreAdapterManager.repositoryManager;
        this._mapperManager = mapperManager;
        this._userProvider = userProvider;
    }

    private ExpectRole(role: Role): void
    {
        RoleAuthorizationGuard.assertExpectedRole(this._userProvider.getCurrentUser()?.role!, role);
    }

    private getCalledBy(): string
    {
        const current = this._userProvider.getCurrentUser();
        return current?.name ?? "System";
    }

    private async GetProductAndCheckIfItExists(id: number): Promise<Product>
    {
        const productEntity = await this._repositoryManager.productRepository.GetProductById(id);

        if (!productEntity)
        {
            throw new ProductNotFoundException(id);
        }

        return productEntity;
    }

    async GetListProduct(parameters: ProductParameter): Promise<PagedResult<ProductDto>>
    {
        this.ExpectRole('admin');

        const pagedProducts = await this._repositoryManager.productRepository.GetListProduct(parameters);

        return {
            items: pagedProducts.items.map(product => this._mapperManager.productMapper.ProductToDto(product)),
            meta: pagedProducts.meta,
        };
    }

    async GetProduct(id: number): Promise<ProductDto>
    {
        const productEntity = await this.GetProductAndCheckIfItExists(id);

        return this._mapperManager.productMapper.ProductToDto(productEntity);
    }

    async CreateProduct(productForCreateDto: ProductForCreateDto): Promise<ProductDto>
    {
        this.ExpectRole('admin');

        const existingProduct = await this._repositoryManager.productRepository.GetProductByCode(productForCreateDto.code, true);

        if (existingProduct && !existingProduct.deleted)
        {
            throw new ProductDuplicateBadRequestException(productForCreateDto.code);
        }

        const dateNow = new Date().toISOString();

        const newProduct: Product = {
            id: 0,
            code: productForCreateDto.code,
            name: productForCreateDto.name,
            productTypeId: productForCreateDto.productTypeId,
            productTypeCode: "",
            productTypeName: "",
            createdAt: dateNow,
            updatedAt: dateNow,
            createdBy: this.getCalledBy(),
            updatedBy: this.getCalledBy(),
            deleted: false,
        };

        try
        {
            if (existingProduct && existingProduct.deleted)
            {
                const restoredProduct = await this._repositoryManager.productRepository.UpdateProduct({
                    ...existingProduct,
                    ...newProduct,
                    id: existingProduct.id,
                    deleted: false,
                });

                return this._mapperManager.productMapper.ProductToDto(restoredProduct);
            }

            const createdProduct = await this._repositoryManager.productRepository.CreateProduct(newProduct);
            return this._mapperManager.productMapper.ProductToDto(createdProduct);
        }
        catch (error: any)
        {
            if (error.code === "23505")
            {
                throw new ProductDuplicateBadRequestException(productForCreateDto.code);
            }

            throw error;
        }
    }

    async UpdateProduct(id: number, productForUpdateDto: ProductForUpdateDto): Promise<ProductDto>
    {
        this.ExpectRole('admin');

        const productEntity = await this.GetProductAndCheckIfItExists(id);

        if (productForUpdateDto.code)
        {
            const existingProductWithCode = await this._repositoryManager.productRepository.GetProductByCode(productForUpdateDto.code, false);

            if (existingProductWithCode && existingProductWithCode.id !== id && !existingProductWithCode.deleted)
            {
                throw new ProductDuplicateBadRequestException(productForUpdateDto.code);
            }
        }

        const updatedProduct: Product = {
            ...productEntity,
            code: productForUpdateDto.code ?? productEntity.code,
            name: productForUpdateDto.name ?? productEntity.name,
            productTypeId: productForUpdateDto.productTypeId ?? productEntity.productTypeId,
            updatedAt: new Date().toISOString(),
            updatedBy: this.getCalledBy(),
        };

        try
        {
            const result = await this._repositoryManager.productRepository.UpdateProduct(updatedProduct);
            return this._mapperManager.productMapper.ProductToDto(result);
        }
        catch (error: any)
        {
            if (error.code === "23505")
            {
                throw new ProductDuplicateBadRequestException(productForUpdateDto.code!);
            }

            throw error;
        }
    }

    async DeleteProduct(id: number): Promise<void>
    {
        this.ExpectRole('admin');

        await this.GetProductAndCheckIfItExists(id);
        await this._repositoryManager.productRepository.DeleteProduct(id);
    }

    async DeleteProductCollection(ids: number[]): Promise<void>
    {
        for (const id of ids)
        {
            await this.DeleteProduct(id);
        }
    }
}
