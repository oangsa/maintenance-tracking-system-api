import { BadRequestException } from "../BadRequestException";

export class WorkOrderSequenceDuplicateException extends BadRequestException
{
    constructor(repairRequestId: number , orderSequence: number)
    {
        super(`Work Order Sequence: '${orderSequence}' already exists for Repair Request ID: '${repairRequestId}'.`);
    }
}
