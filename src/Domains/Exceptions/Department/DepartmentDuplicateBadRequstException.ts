import { BadRequestException } from "../BadRequestException";

export class DepartmentDuplicateBadRequestException extends BadRequestException
{
    constructor(code: string)
    {
        super(`Department with Code: '${code}' already exists.`);
    }
}
