import { RepairRequestItemStatus } from "@/Infrastructures/Entities/Master/RepairRequestItemStatus";
import { RepairRequestItemStatusParameter } from "../RequestFeatures/RepairRequestItemStatusParameter";
import { PagedResult } from "../RequestFeatures/Core/PageResult";

export interface IRepairRequestItemStatusRepository
{
    GetRepairRequestItemStatusById(id: number): Promise<RepairRequestItemStatus | null>;
    GetRepairRequestItemStatusByCode(code: string, includeDeleted?: boolean): Promise<RepairRequestItemStatus | null>;
    GetListRepairRequestItemStatus(parameters: RepairRequestItemStatusParameter): Promise<PagedResult<RepairRequestItemStatus>>;
    CreateRepairRequestItemStatus(repairRequestItemStatus: RepairRequestItemStatus): Promise<RepairRequestItemStatus>;
    UpdateRepairRequestItemStatus(repairRequestItemStatus: Partial<RepairRequestItemStatus>): Promise<RepairRequestItemStatus>;
    DeleteRepairRequestItemStatus(id: number): Promise<void>;
}
