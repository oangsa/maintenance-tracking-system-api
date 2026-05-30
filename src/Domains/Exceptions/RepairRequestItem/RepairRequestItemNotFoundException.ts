import { NotFoundException } from "../NotFoundException";

export class RepairRequestItemNotFoundException extends NotFoundException
{
    constructor(id: number)
    {
        super(`Repair request item with id ${id} is not exist.`);
    }
}
