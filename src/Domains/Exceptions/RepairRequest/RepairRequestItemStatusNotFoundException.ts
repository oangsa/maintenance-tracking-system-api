import { NotFoundException } from "../NotFoundException";

type RepairRequestItemStatusSearchableFields = "id" | "code";

export class RepairRequestItemStatusNotFoundException extends NotFoundException
{
    constructor(value: number | string, field: RepairRequestItemStatusSearchableFields = "id")
    {
        super(`Repair request item status with ${field} ${value} is not exist.`);
    }
}
