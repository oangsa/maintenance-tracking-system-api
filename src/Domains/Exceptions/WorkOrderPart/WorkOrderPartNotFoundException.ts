import { NotFoundException } from "../NotFoundException";

export class WorkOrderPartNotFoundException extends NotFoundException
{
    constructor(id: number)
    {
        super(`Work Order Part with id ${id} is not exist.`);
    }
}



