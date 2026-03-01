import { RequestParameters } from "./Core/RequestParameters";

export interface DepartmentParameter extends RequestParameters
{
    orderBy?: "id" | "code" | "name"
}
