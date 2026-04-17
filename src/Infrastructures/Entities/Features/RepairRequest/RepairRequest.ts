import { RepairStatus } from "../../Master/RepairStatus";
import { User } from "../../Master/User";
import { RepairPriority } from "../../../../Shared/Enums/RepairPriority";
import { RepairRequestItem } from "./RepairRequestItem";

export interface RepairRequest
{
    id: number;
    requestNo: string;
    requesterId: number;
    priority: RepairPriority;
    requestedAt: string | null;
    currentStatusId: number;
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;

    currentStatus: Pick<RepairStatus, "id" | "code" | "name" | "orderSequence" | "isFinal"> | null;
    requester: Pick<User, "id" | "email" | "name" | "role"> | null;
    requestedItems: RepairRequestItem[];
}