import { RequestParameters } from "./Core/RequestParameters";

export interface RepairRequestItemParameter extends RequestParameters
{
    orderBy?: "id" | "created_at" | "quantity" | "product_code" | "item_status_code";
}
