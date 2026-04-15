import { RequestParameters } from "./Core/RequestParameters";

export interface ProductTypeParameter extends RequestParameters
{
    orderBy?: "id" | "code" | "name"
}
