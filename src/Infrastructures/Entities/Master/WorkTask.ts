
export interface WorkTask{
    id: number;
    workOrderId: number;
    description: string;
    note: string | null;
    startedAt: string | null;
    endedAt: string | null;

    assigneeId: number | null;
    assigneeName: string | null;
    assigneeEmail: string | null;

    assignedById: number | null;
    assignedByName: string | null;
    
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;

}


