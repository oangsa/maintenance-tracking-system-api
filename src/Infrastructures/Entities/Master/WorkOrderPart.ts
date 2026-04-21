import { Part } from "./Part";

export interface WorkOrderPart  
{  
    id: number;
    workOrderId: number;
    partId: number;
    partCode: string | null;
    partName: string | null;
    quantity: number;
    note: string | null;
    inventoryMoveItemId: number | null;
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    part: Pick<Part, "id" | "code" | "name"> | null;
};