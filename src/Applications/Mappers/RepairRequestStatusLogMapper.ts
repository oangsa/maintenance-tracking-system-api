import { RepairRequestStatusLogDto } from "../DataTransferObjects/RepairRequest/RepairRequestStatusLogDto";
import { RepairRequestStatusLog } from "@/Infrastructures/Entities/Features/RepairRequest/RepairRequestStatusLog";

export interface IRepairRequestStatusLogMapper
{
    RepairRequestStatusLogToDto(log: RepairRequestStatusLog): RepairRequestStatusLogDto;
}

export class RepairRequestStatusLogMapper implements IRepairRequestStatusLogMapper
{
    RepairRequestStatusLogToDto(log: RepairRequestStatusLog): RepairRequestStatusLogDto
    {
        return {
            id: log.id,
            repairRequestId: log.repairRequestId,
            oldStatusId: log.oldStatusId,
            oldStatusCode: log.oldStatus?.code ?? null,
            oldStatusName: log.oldStatus?.name ?? null,
            newStatusId: log.newStatusId,
            newStatusCode: log.newStatus?.code ?? "",
            newStatusName: log.newStatus?.name ?? "",
            changedBy: log.changedBy,
            changedByName: log.changedByUser?.name ?? null,
            changedByEmail: log.changedByUser?.email ?? null,
            note: log.note,
            changedAt: log.changedAt,
        };
    }
}
