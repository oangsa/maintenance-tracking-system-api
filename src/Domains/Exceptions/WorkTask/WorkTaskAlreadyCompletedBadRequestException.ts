import { BadRequestException } from "../BadRequestException";

export class WorkTaskAlreadyCompletedBadRequestException extends BadRequestException
{
    constructor(id: number)
    {
        super(`Work Task with id '${id}' is already completed and cannot be reassigned or modified.`);
    }
}