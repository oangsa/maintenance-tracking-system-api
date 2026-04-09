import { NotFoundException } from "../index";

type PartSearchableFields = "id" | "code"

export class PartNotFoundException extends NotFoundException
{
    constructor(id: number, field: PartSearchableFields = "id")
    {
        super(`Part with ${field} ${id} is not exist.`);
    }
}
