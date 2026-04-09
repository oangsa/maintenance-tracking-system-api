import { NotFoundException } from "../NotFoundException";

type RepairStatusSearchableFields = "id" | "name";

export class RepairStatusNotFoundException extends NotFoundException 
{
    constructor(id: number | string, field: RepairStatusSearchableFields = "id") 
    {
        super(`Repair Status with ${field} ${id} does not exist.`);
        
    }
}