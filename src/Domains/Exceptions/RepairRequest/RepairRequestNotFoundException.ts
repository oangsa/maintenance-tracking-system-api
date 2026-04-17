import { NotFoundException } from "../NotFoundException";

type RepairRequestSearchableFields = "id" | "requestNo";

export class RepairRequestNotFoundException extends NotFoundException
{
    constructor(value: number | string, field: RepairRequestSearchableFields = "id")
    {
        super(`Repair request with ${field} ${value} is not exist.`);
    }
}