import { WorkOrder } from "../../Infrastructures/Entities/Master/WorkOrder";
import { WorkOrderParameter } from "../RequestFeatures/WorkOrderParameter";
import { PagedResult } from "../RequestFeatures/Core/PageResult";

export interface IWorkOrderRepository
{
    GetWorkOrderById(id: number): Promise<WorkOrder | null>;
    CheckOrderSequenceExists(repairRequestId: number, orderSequence: number): Promise<boolean>;
    GetListWorkOrder(parameters: WorkOrderParameter): Promise<PagedResult<WorkOrder>>;
    GetListWorkOrderByRepairRequestId(repairRequestId: number, parameters: WorkOrderParameter): Promise<PagedResult<WorkOrder>>;
    CreateWorkOrder(workOrder: WorkOrder): Promise<WorkOrder>;
    UpdateWorkOrder(workOrder: Partial<WorkOrder>): Promise<WorkOrder>;
    DeleteWorkOrder(id: number): Promise<void>;
}
