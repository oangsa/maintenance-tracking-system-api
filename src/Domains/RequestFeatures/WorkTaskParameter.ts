import { RequestParameters } from "./Core/RequestParameters";

export interface WorkTaskParameter extends RequestParameters
{
    orderBy?:  "id" | "work_order_id" | "description" | "started_at" | "ended_at" | "created_at";
    workOrderId?: number;
    assigneeId?: number;

}