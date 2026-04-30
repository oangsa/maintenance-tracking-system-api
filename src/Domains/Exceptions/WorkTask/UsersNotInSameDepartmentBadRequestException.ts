import { BadRequestException } from "../BadRequestException";

export class UsersNotInSameDepartmentBadRequestException extends BadRequestException
{
    constructor()
    {
        super(`Assignee must belong to the same department as the related work order.`);
    }
}
