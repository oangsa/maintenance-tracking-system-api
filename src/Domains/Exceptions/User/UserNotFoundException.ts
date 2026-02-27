import { NotFoundException } from "../index";

export class UserNotFoundException extends NotFoundException
{
    constructor(id: number)
    {
        super(`User with id ${id} is not exist.`);
    }
}
