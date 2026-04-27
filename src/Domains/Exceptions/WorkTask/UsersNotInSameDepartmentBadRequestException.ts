import { BadRequestException } from "../BadRequestException";

export class UsersNotInSameDepartmentBadRequestException extends BadRequestException
{
    constructor()
    {
        super(`Assignee and Assigner must belong to the same department.`);
    }
}