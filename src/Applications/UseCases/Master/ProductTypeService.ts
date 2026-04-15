import { ProductTypeDto } from "../../DataTransferObjects/ProductType/ProductTypeDto";
import { ProductTypeForCreateDto } from "../../DataTransferObjects/ProductType/ProductTypeForCreateDto";
import { ProductTypeForUpdateDto } from "../../DataTransferObjects/ProductType/ProductTypeForUpdateDto";
import { ProductTypeParameter } from "../../../Domains/RequestFeatures/ProductTypeParameter";
import { PagedResult } from "../../../Domains/RequestFeatures/Core/PageResult";
import { IProductTypeService } from "../../Services/IProductTypeService";
import { IRepositoryManager } from "../../../Domains/Repositories/Core/IRepositoryManager";
import { IMapperManager } from "../../Mappers/Core/MapperManager";
import { IUserProvider } from "../../Providers/UserProvider";
import { ICoreAdapterManager } from "../CoreAdapterManager";
import { ProductTypeNotFoundException } from "../../../Domains/Exceptions/ProductType/ProductTypeNotFoundException";
import { ProductType } from "../../../Infrastructures/Entities/Master/ProductType";
import { ProductTypeDuplicateBadRequestException } from "../../../Domains/Exceptions/ProductType/ProductTypeDuplicateBadRequestException";
import { RoleAuthorizationGuard } from "../../../Shared/Utilities/Authentication/RoleAuthorizationGuard";
import { Role } from "../../../Shared/Enums/Role";

export class ProductTypeService implements IProductTypeService
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

    private async GetProductTypeAndCheckIfItExists(id: number): Promise<ProductType>
    {
        const productTypeEntity = await this._repositoryManager.productTypeRepository.GetProductTypeById(id);

        if (!productTypeEntity)
        {
            throw new ProductTypeNotFoundException(id);
        }

        return productTypeEntity;
    }

    async GetListProductType(parameters: ProductTypeParameter): Promise<PagedResult<ProductTypeDto>>
    {
        this.ExpectRole('admin');

        const pagedProductTypes = await this._repositoryManager.productTypeRepository.GetListProductType(parameters);

        return {
            items: pagedProductTypes.items.map(productType => this._mapperManager.productTypeMapper.ProductTypeToDto(productType)),
            meta: pagedProductTypes.meta,
        };
    }

    async GetProductType(id: number): Promise<ProductTypeDto>
    {
        const productTypeEntity = await this.GetProductTypeAndCheckIfItExists(id);

        return this._mapperManager.productTypeMapper.ProductTypeToDto(productTypeEntity);
    }

    async CreateProductType(productTypeForCreateDto: ProductTypeForCreateDto): Promise<ProductTypeDto>
    {
        this.ExpectRole('admin');

        const existingProductType = await this._repositoryManager.productTypeRepository.GetProductTypeByCode(productTypeForCreateDto.code, true);

        if (existingProductType && !existingProductType.deleted)
        {
            throw new ProductTypeDuplicateBadRequestException(productTypeForCreateDto.code);
        }

        const dateNow = new Date().toISOString();

        const newProductType: ProductType = {
            id: 0,
            code: productTypeForCreateDto.code,
            name: productTypeForCreateDto.name,
            departmentId: productTypeForCreateDto.departmentId,
            createdAt: dateNow,
            updatedAt: dateNow,
            createdBy: this.getCalledBy(),
            updatedBy: this.getCalledBy(),
            deleted: false,
        };

        try
        {
            if (existingProductType && existingProductType.deleted)
            {
                const restoredProductType = await this._repositoryManager.productTypeRepository.UpdateProductType({
                    ...existingProductType,
                    ...newProductType,
                    id: existingProductType.id,
                    deleted: false,
                });

                return this._mapperManager.productTypeMapper.ProductTypeToDto(restoredProductType);
            }

            const createdProductType = await this._repositoryManager.productTypeRepository.CreateProductType(newProductType);
            return this._mapperManager.productTypeMapper.ProductTypeToDto(createdProductType);
        }
        catch (error: any)
        {
            if (error.code === "23505")
            {
                throw new ProductTypeDuplicateBadRequestException(productTypeForCreateDto.code);
            }

            throw error;
        }

    }

    async UpdateProductType(id: number, productTypeForUpdateDto: ProductTypeForUpdateDto): Promise<ProductTypeDto>
    {
        this.ExpectRole('admin');

        const productTypeEntity = await this.GetProductTypeAndCheckIfItExists(id);

        if (productTypeForUpdateDto.code)
        {
            const existingProductTypeWithCode = await this._repositoryManager.productTypeRepository.GetProductTypeByCode(productTypeForUpdateDto.code, false);

            if (existingProductTypeWithCode && existingProductTypeWithCode.id !== id && !existingProductTypeWithCode.deleted)
            {
                throw new ProductTypeDuplicateBadRequestException(productTypeForUpdateDto.code);
            }
        }

        const updatedProductType: ProductType = {
            ...productTypeEntity,
            code: productTypeForUpdateDto.code ?? productTypeEntity.code,
            name: productTypeForUpdateDto.name ?? productTypeEntity.name,
            departmentId: productTypeForUpdateDto.departmentId ?? productTypeEntity.departmentId,
            updatedAt: new Date().toISOString(),
            updatedBy: this.getCalledBy(),
        };

        try
        {
            const result = await this._repositoryManager.productTypeRepository.UpdateProductType(updatedProductType);
            return this._mapperManager.productTypeMapper.ProductTypeToDto(result);
        }
        catch (error: any)
        {
            if (error.code === "23505")
            {
                throw new ProductTypeDuplicateBadRequestException(productTypeForUpdateDto.code!);
            }

            throw error;
        }
    }

    async DeleteProductType(id: number): Promise<void>
    {
        this.ExpectRole('admin');

        await this.GetProductTypeAndCheckIfItExists(id);
        await this._repositoryManager.productTypeRepository.DeleteProductType(id);
    }

    async DeleteProductTypeCollection(ids: number[]): Promise<void>
    {
        for (const id of ids)
        {
            await this.DeleteProductType(id);
        }
    }
}
