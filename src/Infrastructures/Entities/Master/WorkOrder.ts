export interface WorkOrder
{
    id: number;
    repairRequestId : number;
    scheduledStart: string;
    scheduledEnd: string;
    orderSequence: number;
    isFinal: boolean;
    statusId: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
}
