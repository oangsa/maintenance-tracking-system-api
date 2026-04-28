import { ProductTypeDto } from "@/Applications/DataTransferObjects/ProductType/ProductTypeDto";
import { ProductTypeForCreateDto } from "@/Applications/DataTransferObjects/ProductType/ProductTypeForCreateDto";
import { ProductTypeForUpdateDto } from "@/Applications/DataTransferObjects/ProductType/ProductTypeForUpdateDto";
import { ProductTypeProductsResponseDto, ProductTypePartsResponseDto } from "@/Applications/DataTransferObjects/ProductType/ProductTypeSubResourceResponseDTO";
import { ProductTypeParameter } from "@/Domains/RequestFeatures/ProductTypeParameter";
import { PagedResult } from "@/Domains/RequestFeatures/Core/PageResult";

export interface IProductTypeService
{
    GetListProductType(parameters: ProductTypeParameter): Promise<PagedResult<ProductTypeDto>>;
    GetProductType(id: number): Promise<ProductTypeDto>;
    CreateProductType(productTypeForCreateDto: ProductTypeForCreateDto): Promise<ProductTypeDto>;
    UpdateProductType(id: number, ProductTypeForUpdateDto: ProductTypeForUpdateDto): Promise<ProductTypeDto>;
    DeleteProductType(id: number): Promise<void>;
    DeleteProductTypeCollection(ids: number[]): Promise<void>;

    GetProductsByProductTypeId(id: number): Promise<ProductTypeProductsResponseDto>;
    GetPartsByProductTypeId(id: number): Promise<ProductTypePartsResponseDto>;
}
