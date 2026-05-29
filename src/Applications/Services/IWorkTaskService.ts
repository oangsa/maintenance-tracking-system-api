import { WorkTaskDto } from "../DataTransferObjects/WorkTask/WorkTaskDto";
import { WorkTaskForCreateDto } from "../DataTransferObjects/WorkTask/WorkTaskForCreateDto";
import { WorkTaskForUpdateDto } from "../DataTransferObjects/WorkTask/WorkTaskForUpdateDto";
import { WorkTaskAssignForCreateDto } from "../DataTransferObjects/WorkTask/WorkTaskAssignForCreateDto";
import { WorkTaskAssignDto } from "../DataTransferObjects/WorkTask/WorkTaskAssignDto";
import { WorkTaskParameter } from "../../Domains/RequestFeatures/WorkTaskParameter";
import { PagedResult } from "../../Domains/RequestFeatures/Core/PageResult";

export interface IWorkTaskService
{
    GetListWorkTask(parameters: WorkTaskParameter): Promise<PagedResult<WorkTaskDto>>;
    GetWorkTask(id: number): Promise<WorkTaskDto>;
    GetAssignmentHistory(id: number): Promise<WorkTaskAssignDto[]>;
    CreateWorkTask(WorkTaskForCreateDto: WorkTaskForCreateDto): Promise<WorkTaskDto>;
    UpdateWorkTask(id: number, WorkTaskForUpdateDto: WorkTaskForUpdateDto): Promise<WorkTaskDto>;
    AssignWorkTask(id: number, WorkTaskAssignForCreateDto: WorkTaskAssignForCreateDto): Promise<WorkTaskDto>;
    UnassignWorkTask(id: number): Promise<WorkTaskDto>;
    DeleteWorkTask(id: number): Promise<void>;
    DeleteWorkTaskCollection(ids: number[]): Promise<void>;
}