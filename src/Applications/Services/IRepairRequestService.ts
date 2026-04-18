import { RepairRequestDto } from "../DataTransferObjects/RepairRequest/RepairRequestDto";
import { RepairRequestItemDto } from "../DataTransferObjects/RepairRequestItem/RepairRequestItemDto";
import { RepairRequestForCreateDto } from "../DataTransferObjects/RepairRequest/RepairRequestForCreateDto";
import { RepairRequestForUpdateDto } from "../DataTransferObjects/RepairRequest/RepairRequestForUpdateDto";
import { RepairRequestStatusLogDto } from "../DataTransferObjects/RepairRequest/RepairRequestStatusLogDto";
import { RepairRequestParameter } from "../../Domains/RequestFeatures/RepairRequestParameter";
import { PagedResult } from "../../Domains/RequestFeatures/Core/PageResult";
import { RepairRequestItemForCreateDto } from "../DataTransferObjects/RepairRequestItem/RepairRequestItemForCreateDto";

export interface IRepairRequestService
{
    GetListRepairRequest(parameters: RepairRequestParameter): Promise<PagedResult<RepairRequestDto>>;
    GetRepairRequest(id: number): Promise<RepairRequestDto>;

    // TODO: Consider returning PagedResult<RepairRequestItemDto> if the number of items can be large
    GetRepairRequestItems(id: number): Promise<RepairRequestItemDto[]>;

    // TODO: Consider returning PagedResult<RepairRequestStatusLogDto> if the number of items can be large
    GetRepairRequestAudits(id: number): Promise<RepairRequestStatusLogDto[]>;

    CreateRepairRequest(repairRequestForCreateDto: RepairRequestForCreateDto): Promise<RepairRequestDto>;
    CreateRepairRequestItems(repairRequestId: number, repairRequestItemForCreateDtos: RepairRequestItemForCreateDto[]): Promise<RepairRequestItemDto[]>;
    UpdateRepairRequest(id: number, repairRequestForUpdateDto: RepairRequestForUpdateDto): Promise<RepairRequestDto>;
    DeleteRepairRequest(id: number): Promise<void>;
    DeleteRepairRequestCollection(ids: number[]): Promise<void>;
}
