import { RequestParameters } from "./Core/RequestParameters";

export interface ProductParameter extends RequestParameters
{
    orderBy?: "id" | "code" | "name"
}
