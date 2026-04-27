import { BadRequestException } from "../BadRequestException";

export class WorkTaskAlreadyExistsBadRequestException extends BadRequestException
{
    constructor(workOrderId: number)
    {
        super(`Work Task for Work Order ID '${workOrderId}' already exists.`);
    }
}