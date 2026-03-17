export class ForbiddenException extends Error
{
    constructor(message: string = "You do not have permission to perform this action.")
    {
        super(message);
        this.name = "ForbiddenException";
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
