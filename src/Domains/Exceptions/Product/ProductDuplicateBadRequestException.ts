import { BadRequestException } from "../BadRequestException";

export class ProductDuplicateBadRequestException extends BadRequestException
{
    constructor(code: string)
    {
        super(`Product with Code: '${code}' already exists.`);
    }
}
