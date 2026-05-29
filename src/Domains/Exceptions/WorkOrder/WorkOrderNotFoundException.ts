import { NotFoundException } from "../NotFoundException";

export class WorkOrderNotFoundException extends NotFoundException
{
    constructor(id: number)
    {
        super(`Work Order with id ${id} is not exist.`);
    }
}
