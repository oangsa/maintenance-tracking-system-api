import { ProductTypeDto } from "../DataTransferObjects/ProductType/ProductTypeDto";
import { ProductType } from "@/Infrastructures/Entities/Master/ProductType";

export interface IProductTypeMapper
{
    ProductTypeToDto(productType: ProductType): ProductTypeDto;
}

export class ProductTypeMapper implements IProductTypeMapper
{
    ProductTypeToDto(productType: ProductType): ProductTypeDto
    {
        return {
            id: productType.id,
            code: productType.code,
            name: productType.name,
            departmentId: productType.departmentId,
            createdAt: productType.createdAt,
            updatedAt: productType.updatedAt,
            createdBy: productType.createdBy,
            updatedBy: productType.updatedBy,
        };
    }
}
