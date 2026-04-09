import { RequestParameters } from "./Core/RequestParameters";

export interface PartParameter extends RequestParameters
{
    orderBy?: "id" | "code" | "name"
}
