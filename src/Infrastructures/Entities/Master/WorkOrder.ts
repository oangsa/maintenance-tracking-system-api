import { RepairRequestItem } from "../Features/RepairRequest/RepairRequestItem";

export interface WorkOrder
{
    id: number;
    repairRequestItemId : number;
    scheduledStart: string;
    scheduledEnd: string;
    orderSequence: number;
    isFinal: boolean;
    statusId: number | null;
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;

    repairRequestItem?: Pick<RepairRequestItem, "id" | "description" | "repairStatusId" | "product" | "repairStatus"> | null;
    repairRequestRequestNo?: string | null;
}
