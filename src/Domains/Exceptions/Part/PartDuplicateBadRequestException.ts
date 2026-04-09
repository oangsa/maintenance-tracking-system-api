import { BadRequestException } from "../BadRequestException";

export class PartDuplicateBadRequestException extends BadRequestException
{
    constructor(code: string)
    {
        super(`Part with Code: '${code}' already exists.`);
    }
}
