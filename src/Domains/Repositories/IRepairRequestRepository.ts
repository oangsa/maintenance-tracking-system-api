import { RepairRequest } from "../Infrastructure/Entities/Features/RepairRequest/RepairRequest";

export interface IRepairRequestRepository
{
  GetRepairRequestById(id: number): Promise<RepairRequest | null>;
  GetRepairRequestByRequestNo(requestNo: string, includeDeleted?: boolean): Promise<RepairRequest | null>;
  GetListRepairRequest(parameters: RepairRequestParameter): Promise<PagedResult<RepairRequest>>;
  CreateRepairRequest(repairRequest: RepairRequest): Promise<RepairRequest>;
  UpdateRepairRequest(repairRequest: Partial<RepairRequest>): Promise<RepairRequest>;
  DeleteRepairRequest(id: number): Promise<void>;
}
