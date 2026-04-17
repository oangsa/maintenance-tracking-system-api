import { Product } from "../../Master/Product";
import { RepairRequestItemStatus } from "../../Master/RepairRequestItemStatus";

export interface RepairRequestItem
{
    id: number;
    repairRequestId: number;
    productId: number;
    description: string;
    quantity: number;
    repairStatusId: number | null;
    departmentId: number;
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;

    product: Pick<Product, "id" | "code" | "name" | "productTypeId"> | null;
    repairStatus: Pick<RepairRequestItemStatus, "id" | "code" | "name" | "orderSequence" | "isFinal"> | null;
}