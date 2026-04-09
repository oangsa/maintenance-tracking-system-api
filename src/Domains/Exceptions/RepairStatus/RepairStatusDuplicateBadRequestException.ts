import { BadRequestException } from "../BadRequestException";

export class RepairStatusDuplicateBadRequestException extends BadRequestException
{
    constructor(code: string)
    {
        super(`Repair Status with Code: '${code}' already exists.`);
    }
}