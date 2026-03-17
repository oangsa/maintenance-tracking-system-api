import { RequestParameters } from "./Core/RequestParameters";

export interface RepairRequestParameter extends RequestParameters
{
    orderBy?: "id" | "currentStatusId" | "requestedAt" | "priority"
}
