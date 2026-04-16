import { ProductDto } from "../DataTransferObjects/Product/ProductDto";
import { Product } from "@/Infrastructures/Entities/Master/Product";

export interface IProductMapper
{
    ProductToDto(product: Product): ProductDto;
}

export class ProductMapper implements IProductMapper
{
    ProductToDto(product: Product): ProductDto
    {
        return {
            id: product.id,
            code: product.code,
            name: product.name,
            productTypeId: product.productTypeId,
            productTypeCode: product.productTypeCode,
            productTypeName: product.productTypeName,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            createdBy: product.createdBy,
            updatedBy: product.updatedBy,
        };
    }
}
