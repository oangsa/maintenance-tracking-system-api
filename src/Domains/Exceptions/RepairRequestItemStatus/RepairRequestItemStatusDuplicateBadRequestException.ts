import { BadRequestException } from "../BadRequestException";

export class RepairRequestItemStatusDuplicateBadRequestException extends BadRequestException
{
    constructor(code: string)
    {
        super(`Repair request item status with Code: '${code}' already exists.`);
    }
}
