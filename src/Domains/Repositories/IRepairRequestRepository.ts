import { RepairRequest } from "../../Infrastructures/Entities/Features/RepairRequest/RepairRequest";
import { RepairRequestParameter } from "../../Domains/RequestFeatures/RepairRequestParameter"; 
import { PagedResult } from "../RequestFeatures/Core/PageResult";

export interface IRepairRequestRepository
{
  GetRepairRequestById(id: number): Promise<RepairRequest | null>;
  GetRepairRequestByRequestNo(requestNo: string, includeDeleted?: boolean): Promise<RepairRequest | null>;
  GetListRepairRequest(parameters: RepairRequestParameter): Promise<PagedResult<RepairRequest>>;
  CreateRepairRequest(repairRequest: RepairRequest): Promise<RepairRequest>;
  UpdateRepairRequest(repairRequest: Partial<RepairRequest>): Promise<RepairRequest>;
  DeleteRepairRequest(id: number): Promise<void>;
}
