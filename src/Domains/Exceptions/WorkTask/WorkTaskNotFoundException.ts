import { NotFoundException } from "../NotFoundException";

type WorkTaskSearchableFields = "id" | "workOrderId";

export class WorkTaskNotFoundException extends NotFoundException
{
    constructor(id: number | string, field: WorkTaskSearchableFields = "id")
    {
        super(`Work Task with ${field} '${id}' does not exist.`);
    }
}
