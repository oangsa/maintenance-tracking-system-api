import { InventoryMoveItem } from "./InventoryMoveItem";
import { InventoryMoveReason } from "../../../../Shared/Enums/InventoryMoveReason";

export interface InventoryMove {
    id: number;
    moveNo: string;
    reason: InventoryMoveReason;
    moveDate: string;
    remark: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    deleted: boolean;

    inventoryMoveItems: InventoryMoveItem[];
}