import { BadRequestException } from "../BadRequestException";

export class RepairRequestDuplicateBadRequestException extends BadRequestException
{
    constructor(requestNo: string)
    {
        super(`Repair request with Request No: '${requestNo}' already exists.`);
    }
}
