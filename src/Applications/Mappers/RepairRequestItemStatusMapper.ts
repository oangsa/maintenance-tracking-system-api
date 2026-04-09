import { RepairRequestItemStatusDto } from "../DataTransferObjects/RepairRequestItemStatus/RepairRequestItemStatusDto";
import { RepairRequestItemStatus } from "@/Infrastructures/Entities/Master/RepairRequestItemStatus";

export interface IRepairRequestItemStatusMapper
{
    RepairRequestItemStatusToDto(repairRequestItemStatus: RepairRequestItemStatus): RepairRequestItemStatusDto;
}

export class RepairRequestItemStatusMapper implements IRepairRequestItemStatusMapper
{
    RepairRequestItemStatusToDto(repairRequestItemStatus: RepairRequestItemStatus): RepairRequestItemStatusDto
    {
        return {
            id: repairRequestItemStatus.id,
            code: repairRequestItemStatus.code,
            name: repairRequestItemStatus.name,
            orderSequence: repairRequestItemStatus.orderSequence,
            isFinal: repairRequestItemStatus.isFinal,
            createdAt: repairRequestItemStatus.createdAt,
            updatedAt: repairRequestItemStatus.updatedAt,
            createdBy: repairRequestItemStatus.createdBy,
            updatedBy: repairRequestItemStatus.updatedBy,
        };
    }
}
