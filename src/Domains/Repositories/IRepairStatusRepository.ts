import { RepairStatus } from "@/Infrastructures/Entities/Master/RepairStatus";
import { RepairStatusParameter } from "../RequestFeatures/RepairStatusParameter";
import { PagedResult } from "../RequestFeatures/Core/PageResult";

export interface IRepairStatusRepository
{
    GetRepairStatusById(id: number): Promise<RepairStatus | null>;
    GetRepairStatusByCode(code: string, includeDeleted?: boolean): Promise<RepairStatus | null>;
    GetRepairStatusByName(name: string, includeDeleted?: boolean): Promise<RepairStatus | null>;
    GetListRepairStatus(parameters: RepairStatusParameter): Promise<PagedResult<RepairStatus>>;
    CreateRepairStatus(repairStatus: RepairStatus): Promise<RepairStatus>;
    UpdateRepairStatus(repairStatus: Partial<RepairStatus>): Promise<RepairStatus>;
    DeleteRepairStatus(id: number): Promise<void>;
}