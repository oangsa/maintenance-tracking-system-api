import { RepairRequestStatusLog } from "@/Infrastructures/Entities/Features/RepairRequest/RepairRequestStatusLog";

export interface IRepairRequestStatusLogRepository
{
    CreateStatusLog(log: Omit<RepairRequestStatusLog, "id" | "oldStatus" | "newStatus" | "changedByUser">): Promise<void>;
    GetStatusLogsByRepairRequestId(repairRequestId: number): Promise<RepairRequestStatusLog[]>;
}
