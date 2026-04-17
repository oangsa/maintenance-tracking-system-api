import { BadRequestException } from "../BadRequestException";

export class InventoryMoveDuplicateBadRequestException extends BadRequestException
{
    constructor(moveNo: string)
    {
        super(`Inventory move with move number ${moveNo} already exists.`);
    }
}