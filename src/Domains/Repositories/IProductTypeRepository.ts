import { ProductType } from "@/Infrastructures/Entities/Master/ProductType";
import { Product } from "@/Infrastructures/Entities/Master/Product";
import { Part } from "@/Infrastructures/Entities/Master/Part";
import { ProductTypeParameter } from "../RequestFeatures/ProductTypeParameter";
import { PagedResult } from "../RequestFeatures/Core/PageResult";

export interface IProductTypeRepository
{
    GetProductTypeById(id: number): Promise<ProductType | null>;
    GetProductTypeByCode(code: string, includeDeleted?: boolean): Promise<ProductType | null>;
    GetListProductType(parameters: ProductTypeParameter): Promise<PagedResult<ProductType>>;
    CreateProductType(productType: ProductType): Promise<ProductType>;
    UpdateProductType(productType: Partial<ProductType>): Promise<ProductType>;
    DeleteProductType(id: number): Promise<void>;

    GetAssetsByProductTypeId(id: number): Promise<Product[]>;
    GetPartsByProductTypeId(id: number): Promise<Part[]>;
}
