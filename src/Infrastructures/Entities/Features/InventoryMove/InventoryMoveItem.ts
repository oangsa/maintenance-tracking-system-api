import { Part } from "../../Master/Part";

export interface InventoryMoveItem {
    id: number;
    inventoryMoveId: number;
    partId: number;
    quantityIn: number;
    quantityOut: number;
    note: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    deleted: boolean;

    part: Pick<Part, "id" | "code" | "name">; 
}