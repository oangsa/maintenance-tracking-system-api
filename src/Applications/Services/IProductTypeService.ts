import { ProductTypeDto } from "../../DataTransferObjects/ProductType/ProductTypeDto";
import { ProductTypeForCreateDto } from "../../DataTransferObjects/ProductType/ProductTypeForCreateDto";
import { ProductTypeForUpdateDto } from "../../DataTransferObjects/ProductType/ProductTypeForUpdateDto";
import { ProductTypeParameter } from "../../../Domains/RequestFeatures/ProductTypeParameter";
import { PagedResult } from "../../../Domains/RequestFeatures/Core/PageResult";

export interface IProductTypeService
{
    GetListProductType(parameters: ProductTypeParameter): Promise<PagedResult<ProductTypeDto>>;
    GetProductType(id: number): Promise<ProductTypeDto>;
    CreateProductType(productTypeForCreateDto: ProductTypeForCreateDto): Promise<ProductTypeDto>;
    UpdateProductType(id: number, ProductTypeForUpdateDto: ProductTypeForUpdateDto): Promise<ProductTypeDto>;
    DeleteProductType(id: number): Promise<void>;
    DeleteProductTypeCollection(ids: number[]): Promise<void>;
}
