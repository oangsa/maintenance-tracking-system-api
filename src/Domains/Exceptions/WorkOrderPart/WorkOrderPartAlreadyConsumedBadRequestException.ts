import { BadRequestException } from "../BadRequestException";

export class WorkOrderPartAlreadyConsumedBadRequestException extends BadRequestException
{
    constructor(id: number)
    {
        super(`Work Order Part with id: ${id} has already been consumed (inventory moved) and cannot be modified or deleted. Please process an inventory reversal instead.`);
    }
}