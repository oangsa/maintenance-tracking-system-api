export interface Part
{
    id: number;
    code: string;
    name: string;
    productTypeId: number;
    productTypeCode: string;
    productTypeName: string;
    totalStock: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    deleted: boolean;
}
