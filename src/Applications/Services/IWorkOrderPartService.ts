import { WorkOrderPartDto } from "../DataTransferObjects/WorkOrderPart/WorkOrderPartDto";
import { WorkOrderPartForCreateDto } from "../DataTransferObjects/WorkOrderPart/WorkOrderPartForCreateDto";
import { WorkOrderPartForUpdateDto } from "../DataTransferObjects/WorkOrderPart/WorkOrderPartForUpdateDto";
import { WorkOrderPartParameter } from "../../Domains/RequestFeatures/WorkOrderPartParameter";
import { PagedResult } from "../../Domains/RequestFeatures/Core/PageResult";

export interface IWorkOrderPartService
{
    GetListWorkOrderPart(parameters: WorkOrderPartParameter): Promise<PagedResult<WorkOrderPartDto>>;
    GetWorkOrderPart(id: number): Promise<WorkOrderPartDto>;
    CreateWorkOrderPart(WorkOrderPartForCreateDto: WorkOrderPartForCreateDto): Promise<WorkOrderPartDto>;
    UpdateWorkOrderPart(id: number, WorkOrderPartForUpdateDto: WorkOrderPartForUpdateDto): Promise<WorkOrderPartDto>;
    DeleteWorkOrderPart(id: number): Promise<void>;
    DeleteWorkOrderPartCollection(ids: number[]): Promise<void>;
}
