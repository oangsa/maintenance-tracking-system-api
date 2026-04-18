import { WorkOrderDto } from "../DataTransferObjects/WorkOrder/WorkOrderDto";
import { WorkOrderForCreateDto } from "../DataTransferObjects/WorkOrder/WorkOrderForCreateDto";
import { WorkOrderForUpdateDto } from "../DataTransferObjects/WorkOrder/WorkOrderForUpdateDto";
import { WorkOrderParameter } from "../../Domains/RequestFeatures/WorkOrderParameter";
import { PagedResult } from "../../Domains/RequestFeatures/Core/PageResult";

export interface IWorkOrderService
{
    GetListWorkOrder(parameters: WorkOrderParameter): Promise<PagedResult<WorkOrderDto>>;
    GetWorkOrder(id: number): Promise<WorkOrderDto>;
    CreateWorkOrder(WorkOrderForCreateDto: WorkOrderForCreateDto): Promise<WorkOrderDto>;
    UpdateWorkOrder(id: number, WorkOrderForUpdateDto: WorkOrderForUpdateDto): Promise<WorkOrderDto>;
    DeleteWorkOrder(id: number): Promise<void>;
    DeleteWorkOrderCollection(ids: number[]): Promise<void>;
}
