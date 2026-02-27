import { BadRequestException } from "./BadRequestException";

export class ValidationException extends BadRequestException
{
    constructor(message: string)
    {
        super(message);
        this.name = 'ValidationException';
    }
}
