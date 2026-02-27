export abstract class NotFoundException extends Error
{
    protected constructor(message: string)
    {
        super(message);
        this.name = 'NotFoundException';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
