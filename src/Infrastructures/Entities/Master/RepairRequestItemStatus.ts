export interface RepairRequestItemStatus
{
    id: number;
    code: string;
    name: string;
    orderSequence: number;
    isFinal: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    deleted: boolean;
}
