import { RepairStatusDto } from "../DataTransferObjects/RepairStatus/RepairStatusDto";
import { RepairStatusForCreateDto } from "../DataTransferObjects/RepairStatus/RepairStatusForCreateDto";
import { RepairStatusForUpdateDto } from "../DataTransferObjects/RepairStatus/RepairStatusForUpdateDto";
import { RepairStatusParameter } from "../../Domains/RequestFeatures/RepairStatusParameter";
import { PagedResult } from "../../Domains/RequestFeatures/Core/PageResult";

export interface IRepairStatusService
{
    GetListRepairStatus(parameters: RepairStatusParameter): Promise<PagedResult<RepairStatusDto>>;
    GetRepairStatus(id: number): Promise<RepairStatusDto>;
    CreateRepairStatus(repairStatusForCreateDto: RepairStatusForCreateDto): Promise<RepairStatusDto>;
    UpdateRepairStatus(id: number, repairStatusForUpdateDto: RepairStatusForUpdateDto): Promise<RepairStatusDto>;
    DeleteRepairStatus(id: number): Promise<void>;
}