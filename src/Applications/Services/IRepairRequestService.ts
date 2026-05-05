import { RepairRequestDto } from "../DataTransferObjects/RepairRequest/RepairRequestDto";
import { RepairRequestItemDto } from "../DataTransferObjects/RepairRequestItem/RepairRequestItemDto";
import { RepairRequestForCreateDto } from "../DataTransferObjects/RepairRequest/RepairRequestForCreateDto";
import { RepairRequestForUpdateDto } from "../DataTransferObjects/RepairRequest/RepairRequestForUpdateDto";
import { RepairRequestStatusLogDto } from "../DataTransferObjects/RepairRequest/RepairRequestStatusLogDto";
import { RepairRequestParameter } from "../../Domains/RequestFeatures/RepairRequestParameter";
import { RepairRequestItemParameter } from "../../Domains/RequestFeatures/RepairRequestItemParameter";
import { PagedResult } from "../../Domains/RequestFeatures/Core/PageResult";
import { RepairRequestItemForCreateDto } from "../DataTransferObjects/RepairRequestItem/RepairRequestItemForCreateDto";
import { RepairRequestCountGroupByStatusDto } from "../DataTransferObjects/RepairRequest/RepairRequestCountGroupByStatusDto";
import { TopRepairedProductsPerformanceReportDto } from "../DataTransferObjects/RepairRequest/TopRepairedProductsPerformanceReportDto";

export interface IRepairRequestService
{
    GetListRepairRequest(parameters: RepairRequestParameter): Promise<PagedResult<RepairRequestDto>>;
    GetRepairRequestCountGroupByStatus(parameters: RepairRequestParameter): Promise<PagedResult<RepairRequestCountGroupByStatusDto>>;
    GetTopRepairedProductsPerformanceReport(parameters: RepairRequestParameter): Promise<TopRepairedProductsPerformanceReportDto[]>
    GetRepairRequest(id: number): Promise<RepairRequestDto>;
    GetRepairRequestItems(id: number, parameters: RepairRequestItemParameter): Promise<PagedResult<RepairRequestItemDto>>;
    GetRepairRequestAudits(id: number): Promise<RepairRequestStatusLogDto[]>;
    CreateRepairRequest(repairRequestForCreateDto: RepairRequestForCreateDto): Promise<RepairRequestDto>;
    CreateRepairRequestItems(repairRequestId: number, repairRequestItemForCreateDtos: RepairRequestItemForCreateDto[]): Promise<RepairRequestItemDto[]>;
    UpdateRepairRequest(id: number, repairRequestForUpdateDto: RepairRequestForUpdateDto): Promise<RepairRequestDto>;
    DeleteRepairRequest(id: number): Promise<void>;
    DeleteRepairRequestCollection(ids: number[]): Promise<void>;
}
