import { NotFoundException } from "../NotFoundException";

type ProductSearchableFields = "id" | "code"

export class ProductNotFoundException extends NotFoundException
{
    constructor(id: number, field: ProductSearchableFields = "id")
    {
        super(`Product with ${field} ${id} is not exist.`);
    }
}
