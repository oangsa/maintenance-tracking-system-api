import { RequestParameters } from "./Core/RequestParameters";

export interface WorkOrderPartParameter extends RequestParameters
{
    orderBy?:  "id" | "part_id" | "quantity";
}