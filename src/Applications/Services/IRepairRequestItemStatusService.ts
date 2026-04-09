import { RepairRequestItemStatusDto } from "../DataTransferObjects/RepairRequestItemStatus/RepairRequestItemStatusDto";
import { RepairRequestItemStatusForCreateDto } from "../DataTransferObjects/RepairRequestItemStatus/RepairRequestItemStatusForCreateDto";
import { RepairRequestItemStatusForUpdateDto } from "../DataTransferObjects/RepairRequestItemStatus/RepairRequestItemStatusForUpdateDto";
import { RepairRequestItemStatusParameter } from "../../Domains/RequestFeatures/RepairRequestItemStatusParameter";
import { PagedResult } from "../../Domains/RequestFeatures/Core/PageResult";

export interface IRepairRequestItemStatusService
{
    GetListRepairRequestItemStatus(parameters: RepairRequestItemStatusParameter): Promise<PagedResult<RepairRequestItemStatusDto>>;
    GetRepairRequestItemStatus(id: number): Promise<RepairRequestItemStatusDto>;
    CreateRepairRequestItemStatus(repairRequestItemStatusForCreateDto: RepairRequestItemStatusForCreateDto): Promise<RepairRequestItemStatusDto>;
    UpdateRepairRequestItemStatus(id: number, repairRequestItemStatusForUpdateDto: RepairRequestItemStatusForUpdateDto): Promise<RepairRequestItemStatusDto>;
    DeleteRepairRequestItemStatus(id: number): Promise<void>;
    DeleteRepairRequestItemStatusCollection(ids: number[]): Promise<void>;
}
