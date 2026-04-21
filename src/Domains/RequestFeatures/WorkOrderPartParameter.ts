import { RequestParameters } from "./Core/RequestParameters";

export interface WorkOrderPartParameter extends RequestParameters
{
    orderBy?:  "id" | "partId" | "quantity";
    workOrderId?: number;
}