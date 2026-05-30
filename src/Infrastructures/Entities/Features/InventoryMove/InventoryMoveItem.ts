import { Part } from "../../Master/Part";

export interface InventoryMoveItem {
    id: number;
    inventoryMoveId: number;
    partId: number;
    partCode: string;
    partName: string;
    quantityIn: number;
    quantityOut: number;
    note: string;
    workOrderPartId?: number | null;
    workOrderPartPartCode?: string | null;
    workOrderPartPartName?: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    deleted: boolean;

    part: Pick<Part, "id" | "code" | "name">; 
}
