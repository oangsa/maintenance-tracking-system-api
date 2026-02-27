import { BadRequestException } from "./BadRequestException";

export class QueryBuilderBadRequestException extends BadRequestException
{
    constructor(searchName: string)
    {
        super(`Search with Name: '${searchName}' is wrong`);
    }
}
