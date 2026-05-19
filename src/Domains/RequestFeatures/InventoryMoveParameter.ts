import { RequestParameters } from "./Core/RequestParameters";

export interface InventoryMoveParameter extends RequestParameters 
{
    orderBy?: "id" | "moveNo" | "moveDate" | "reason" | "createdAt";
}