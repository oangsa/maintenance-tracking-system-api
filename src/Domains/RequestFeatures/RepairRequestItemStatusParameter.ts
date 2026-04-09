import { RequestParameters } from "./Core/RequestParameters";

export interface RepairRequestItemStatusParameter extends RequestParameters
{
    orderBy?: "id" | "code" | "name" | "order_sequence" | "is_final";
}
