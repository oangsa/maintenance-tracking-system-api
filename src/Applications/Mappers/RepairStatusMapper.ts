import { RepairStatusDto } from "../DataTransferObjects/RepairStatus/RepairStatusDto";
import { RepairStatus } from "@/Infrastructures/Entities/Master/RepairStatus";

export interface IRepairStatusMapper
{
    RepairStatusToDto(repairStatus: RepairStatus): RepairStatusDto;
}

export class RepairStatusMapper implements IRepairStatusMapper
{
    RepairStatusToDto(repairStatus: RepairStatus): RepairStatusDto
    {
        return {
            id: repairStatus.id,
            code: repairStatus.code,
            name: repairStatus.name,
            orderSequence: repairStatus.orderSequence,
            isFinal: repairStatus.isFinal,
            createdAt: repairStatus.createdAt,
            updatedAt: repairStatus.updatedAt,
            createdBy: repairStatus.createdBy,
            updatedBy: repairStatus.updatedBy,
        };
    }
}