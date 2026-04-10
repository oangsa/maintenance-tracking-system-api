import { RepairRequestDto } from "../DataTransferObjects/RepairRequest/RepairRequestDto";
import { RepairRequestForCreateDto } from "../DataTransferObjects/RepairRequest/RepairRequestForCreateDto";
import { RepairRequestForUpdateDto } from "../DataTransferObjects/RepairRequest/RepairRequestForUpdateDto";
import { RepairRequestParameter } from "../../Domains/RequestFeatures/RepairRequestParameter";
import { PagedResult } from "../../Domains/RequestFeatures/Core/PageResult";

export interface IRepairRequestService
{
    GetListRepairRequest(parameters: RepairRequestParameter): Promise<PagedResult<RepairRequestDto>>;
    GetRepairRequest(id: number): Promise<RepairRequestDto>;
    CreateRepairRequest(repairRequestForCreateDto: RepairRequestForCreateDto): Promise<RepairRequestDto>;
    UpdateRepairRequest(id: number, repairRequestForUpdateDto: RepairRequestForUpdateDto): Promise<RepairRequestDto>;
    DeleteRepairRequest(id: number): Promise<void>;
    DeleteRepairRequestCollection(ids: number[]): Promise<void>;
}
