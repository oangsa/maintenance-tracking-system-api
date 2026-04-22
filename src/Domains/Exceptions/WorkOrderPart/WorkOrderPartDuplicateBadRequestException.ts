import { BadRequestException } from "../BadRequestException";

export class WorkOrderPartDuplicateBadRequestException extends BadRequestException
{
    constructor(partId: number)
    {
        super(`Part with id: ${partId} has already been added to this work order. If you need more, please update the quantity instead.`);
    }
}

