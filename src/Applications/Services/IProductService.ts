import { ProductDto } from "../DataTransferObjects/Product/ProductDto";
import { ProductForCreateDto } from "../DataTransferObjects/Product/ProductForCreateDto";
import { ProductForUpdateDto } from "../DataTransferObjects/Product/ProductForUpdateDto";
import { ProductParameter } from "../../Domains/RequestFeatures/ProductParameter";
import { PagedResult } from "../../Domains/RequestFeatures/Core/PageResult";

export interface IProductService
{
    GetListProduct(parameters: ProductParameter): Promise<PagedResult<ProductDto>>;
    GetProduct(id: number): Promise<ProductDto>;
    CreateProduct(productForCreateDto: ProductForCreateDto): Promise<ProductDto>;
    UpdateProduct(id: number, productForUpdateDto: ProductForUpdateDto): Promise<ProductDto>;
    DeleteProduct(id: number): Promise<void>;
    DeleteProductCollection(ids: number[]): Promise<void>;
}
