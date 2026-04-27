import { WorkTask } from "@/Infrastructures/Entities/Master/WorkTask";
import { WorkTaskAssignment } from "@/Infrastructures/Entities/Master/WorkTaskAssignment";
import { WorkTaskParameter } from "../RequestFeatures/WorkTaskParameter";
import { PagedResult } from "../RequestFeatures/Core/PageResult";

export interface IWorkTaskRepository
{
    GetWorkTaskById(id: number): Promise<WorkTask | null>;
    GetListWorkTask(parameters: WorkTaskParameter): Promise<PagedResult<WorkTask>>;
    CheckWorkTaskExistsByOrderId(workOrderId: number): Promise<boolean>;
    CheckUsersShareDepartment(userId1: number, userId2: number): Promise<boolean>;
    GetAssignmentHistory(workTaskId: number): Promise<WorkTaskAssignment[]>;
    CreateWorkTask(task: Partial<WorkTask>, assigneeId?: number, assignedById?: number): Promise<WorkTask>;
    UpdateWorkTask(task: Partial<WorkTask>): Promise<WorkTask>;
    AssignWorkTask(workTaskId: number, assigneeId: number, assignedById: number, actionByName?: string): Promise<void>;
    UnassignWorkTask(workTaskId: number, actionByName?: string): Promise<void>;
    DeleteWorkTask(id: number): Promise<void>;
}   