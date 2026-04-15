import { BadRequestException } from "../BadRequestException";

export class ProductTypeDuplicateBadRequestException extends BadRequestException
{
    constructor(code: string)
    {
        super(`ProductType with Code: '${code}' already exists.`);
    }
}
