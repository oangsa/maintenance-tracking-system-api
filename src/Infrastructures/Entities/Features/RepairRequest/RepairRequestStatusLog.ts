import { RepairStatus } from "../../Master/RepairStatus";
import { User } from "../../Master/User";

export interface RepairRequestStatusLog
{
    id: number;
    repairRequestId: number;
    oldStatusId: number | null;
    newStatusId: number;
    changedBy: number | null;
    note: string | null;
    changedAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;

    oldStatus: Pick<RepairStatus, "id" | "code" | "name"> | null;
    newStatus: Pick<RepairStatus, "id" | "code" | "name"> | null;
    changedByUser: Pick<User, "id" | "name" | "email"> | null;
}
