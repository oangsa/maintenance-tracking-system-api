import { NotFoundException } from "../NotFoundException";

export class UserNotFoundException extends NotFoundException
{
    constructor(id: number)
    {
        super(`User with id ${id} is not exist.`);
    }
}
