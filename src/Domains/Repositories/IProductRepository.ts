import { Product } from "@/Infrastructures/Entities/Master/Product";
import { ProductParameter } from "../RequestFeatures/ProductParameter";
import { PagedResult } from "../RequestFeatures/Core/PageResult";

export interface IProductRepository
{
    GetProductById(id: number): Promise<Product | null>;
    GetProductByCode(code: string, includeDeleted?: boolean): Promise<Product | null>;
    GetListProduct(parameters: ProductParameter): Promise<PagedResult<Product>>;
    CreateProduct(product: Product): Promise<Product>;
    UpdateProduct(product: Partial<Product>): Promise<Product>;
    DeleteProduct(id: number): Promise<void>;
}
