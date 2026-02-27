import { BadRequestException } from "../BadRequestException";

export class UserDuplicateBadRequestException extends BadRequestException
{
    constructor(email: string)
    {
        super(`User with Email: '${email}' already exists.`);
    }
}
