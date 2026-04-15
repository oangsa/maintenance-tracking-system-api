import { NotFoundException } from "../NotFoundException";

type ProductTypeSearchableFields = "id" | "code"

export class ProductTypeNotFoundException extends NotFoundException
{
    constructor(id: number, field: ProductTypeSearchableFields = "id")
    {
        super(`ProductType with ${field} ${id} is not exist.`);
    }
}
