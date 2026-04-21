import { WorkOrderPart } from "@/Infrastructures/Entities/Master/WorkOrderPart";
import { WorkOrderPartParameter } from "../RequestFeatures/WorkOrderPartParameter";
import { PagedResult } from "../RequestFeatures/Core/PageResult";

export interface IWorkOrderPartRepository
{
    GetWorkOrderPartById(id: number): Promise<WorkOrderPart | null>;
    GetListWorkOrderPart(parameters: WorkOrderPartParameter): Promise<PagedResult<WorkOrderPart>>;
    CreateWorkOrderPart(workOrderPart: WorkOrderPart): Promise<WorkOrderPart>;
    UpdateWorkOrderPart(workOrderPart: Partial<WorkOrderPart>): Promise<WorkOrderPart>;
    DeleteWorkOrderPart(id: number): Promise<void>;
}