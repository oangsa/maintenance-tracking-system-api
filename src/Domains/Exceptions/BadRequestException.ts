export abstract class BadRequestException extends Error
{
    constructor(message: string)
    {
        super(message);
        this.name = 'BadRequestException';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class BadRequestMessageException extends BadRequestException
{
    constructor(message: string)
    {
        super(message);
        this.name = 'BadRequestMessageException';
    }
}
