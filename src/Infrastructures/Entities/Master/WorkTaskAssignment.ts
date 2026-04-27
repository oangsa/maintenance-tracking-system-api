export interface WorkTaskAssignment
{
    id: number;
    workTaskId: number;

    assigneeId: number | null;
    assigneeName: string | null;
    assigneeEmail: string | null;

    assignedById: number | null;
    assignedByName: string | null;

    assignedAt: string;
    unassignedAt: string | null;

    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
}