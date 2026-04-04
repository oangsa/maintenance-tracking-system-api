import { Product } from "../../Master/Product"
import { RepairRequestItemStatus } from "../../Master/RepairRequestItemStatus";

export interface RepairRequestItem
{
    id: number
    repairRequestId: number
    productId: number
    description: string,
    quantity: number,
    repairStatusId: number,
    departmentId: number,
    createdAt: string,
    updatedAt: string,
    createdBy: string,
    updatedBy: string,

    product: Pick<Product, "id" | "code" | "name" | "productTypeId">,
    repairStatus: Pick<RepairRequestItemStatus, "id" | "code" | "name" | "orderSequence" | "isFinal">,
}
