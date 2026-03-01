import { NotFoundException } from "../index";

type DepartmentSearchableFields = "id" | "code"

export class DepartmentNotFoundException extends NotFoundException
{
    constructor(id: number, field: DepartmentSearchableFields = "id")
    {
        super(`Department with ${field} ${id} is not exist.`);
    }
}
