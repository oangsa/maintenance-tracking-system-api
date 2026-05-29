import { RequestParameters } from "./Core/RequestParameters";

export interface WorkOrderParameter extends RequestParameters
{
    orderBy?: "createdAt" | "id" | "order_sequence" | "status_id" | "scheduled_end";
}
