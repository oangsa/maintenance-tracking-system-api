import { RepairRequest } from "../../Infrastructures/Entities/Features/RepairRequest/RepairRequest";
import { RepairRequestItem } from "../../Infrastructures/Entities/Features/RepairRequest/RepairRequestItem";
import { RepairRequestParameter } from "../RequestFeatures/RepairRequestParameter";
import { RepairRequestItemParameter } from "../RequestFeatures/RepairRequestItemParameter";
import { PagedResult } from "../RequestFeatures/Core/PageResult";
import { RepairRequestCountGroupByStatus } from "@/Infrastructures/Entities/Reports/RepairRequestCountGroupByStatus";
import { TopRepairedProductsPerformanceReportDto } from "@/Applications/DataTransferObjects/RepairRequest/TopRepairedProductsPerformanceReportDto";
import { MonthlyRepairTrendByProductTypeReport } from "@/Applications/DataTransferObjects/RepairRequest/MonthlyRepairTrendByProductTypeReportDto";

export interface IRepairRequestRepository
{
    GetRepairRequestById(id: number): Promise<RepairRequest | null>;
    GetRepairRequestByRequestNo(requestNo: string, includeDeleted?: boolean): Promise<RepairRequest | null>;
    GetListRepairRequest(parameters: RepairRequestParameter): Promise<PagedResult<RepairRequest>>;
    GetListRepairRequestItemsByRequestId(repairRequestId: number, parameters: RepairRequestItemParameter): Promise<PagedResult<RepairRequestItem>>;
    GetRepairRequestCountGroupByStatus(parameters: RepairRequestParameter): Promise<PagedResult<RepairRequestCountGroupByStatus>>;
    CreateRepairRequest(repairRequest: RepairRequest): Promise<RepairRequest>;
    CreateRepairRequestItems(repairRequestId: number, items: RepairRequestItem[]): Promise<RepairRequestItem[]>;
    UpdateRepairRequest(repairRequest: Partial<RepairRequest>): Promise<RepairRequest>;
    DeleteRepairRequest(id: number): Promise<void>;
    GetTopRepairedProductsPerformanceReport(parameters: RepairRequestParameter): Promise<TopRepairedProductsPerformanceReportDto[]>;
    GetMonthlyRepairTrendByProductTypeReport(startDate: Date, endDate: Date): Promise<MonthlyRepairTrendByProductTypeReport[]>;
}
