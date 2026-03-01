import { RequestParameters } from "./Core/RequestParameters";

export interface UserParameter extends RequestParameters
{
    orderBy?: "id" | "email"
}
