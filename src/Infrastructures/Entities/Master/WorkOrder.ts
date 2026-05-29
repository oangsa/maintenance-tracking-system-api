import { RepairRequestItem } from "../Features/RepairRequest/RepairRequestItem";

export interface WorkOrder
{
    id: number;
    repairRequestItemId : number;
    scheduledStart: string;
    scheduledEnd: string;
    orderSequence: number;
    isFinal: boolean;
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;

    repairRequestItem?: Pick<RepairRequestItem, "id" | "description" | "repairStatusId" | "product" | "repairStatus"> | null;
    repairRequestRequestNo?: string | null;
    workTask?: {
        id: number;
        description: string;
        note: string | null;
        startedAt: string | null;
        endedAt: string | null;
        assigneeId: number | null;
        assigneeName: string | null;
        assigneeEmail: string | null;
        assignedById: number | null;
        assignedByName: string | null;
        assignedAt: string | null;
        unassignedAt: string | null;
    } | null;
}
