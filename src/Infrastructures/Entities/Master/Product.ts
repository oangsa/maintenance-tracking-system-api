export interface Product
{
    id: number;
    code: string;
    name: string;
    productTypeId: number;
    productTypeCode: string;
    productTypeName: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    deleted: boolean;
}
