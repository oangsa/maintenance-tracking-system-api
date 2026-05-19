import { NotFoundException } from "../NotFoundException";

type InventoryMoveSearchableFields = "id" | "moveNo";

export class InventoryMoveNotFoundException extends NotFoundException
{
    constructor(value: number | string, field: InventoryMoveSearchableFields = "id")
    {
        super(`Inventory move with ${field} ${value} does not exist.`);
    }
}