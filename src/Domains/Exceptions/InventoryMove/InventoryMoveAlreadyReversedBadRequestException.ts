import { BadRequestException } from "../BadRequestException";

export class InventoryMoveAlreadyReversedBadRequestException extends BadRequestException
{
    constructor(id: number)
    {
        super(`Inventory move with id ${id} has already been reversed. A transaction can only be reversed once.`);
    }
}
