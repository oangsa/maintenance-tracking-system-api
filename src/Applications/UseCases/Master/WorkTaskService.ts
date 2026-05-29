import { WorkTaskDto } from "../../DataTransferObjects/WorkTask/WorkTaskDto";
import { WorkTaskForCreateDto } from "../../DataTransferObjects/WorkTask/WorkTaskForCreateDto";
import { WorkTaskForUpdateDto } from "../../DataTransferObjects/WorkTask/WorkTaskForUpdateDto";
import { WorkTaskAssignForCreateDto } from "../../DataTransferObjects/WorkTask/WorkTaskAssignForCreateDto";
import { WorkTaskAssignDto } from "../../DataTransferObjects/WorkTask/WorkTaskAssignDto";
import { WorkTaskParameter } from "../../../Domains/RequestFeatures/WorkTaskParameter";
import { IWorkTaskService } from "../../Services/IWorkTaskService";
import { PagedResult } from "../../../Domains/RequestFeatures/Core/PageResult";
import { IRepositoryManager } from "../../../Domains/Repositories/Core/IRepositoryManager";
import { IMapperManager } from "../../Mappers/Core/MapperManager";
import { IUserProvider } from "../../Providers/UserProvider";
import { ICoreAdapterManager } from "../CoreAdapterManager";
import { WorkTaskNotFoundException } from "../../../Domains/Exceptions/WorkTask/WorkTaskNotFoundException";
import { WorkTaskAlreadyCompletedBadRequestException } from "@/Domains/Exceptions/WorkTask/WorkTaskAlreadyCompletedBadRequestException";
import { WorkTaskAlreadyExistsBadRequestException } from "@/Domains/Exceptions/WorkTask/WorkTaskAlreadyExistsBadRequestException";
import { UsersNotInSameDepartmentBadRequestException } from "@/Domains/Exceptions/WorkTask/UsersNotInSameDepartmentBadRequestException";
import { WorkTask } from "../../../Infrastructures/Entities/Master/WorkTask";
import { RoleAuthorizationGuard } from "../../../Shared/Utilities/Authentication/RoleAuthorizationGuard";
import { Role } from "../../../Shared/Enums/Role";
import { WorkOrderNotFoundException } from "../../../Domains/Exceptions/WorkOrder/WorkOrderNotFoundException";
import { UserNotFoundException } from "../../../Domains/Exceptions/User/UserNotFoundException";
import { ForbiddenException } from "../../../Domains/Exceptions/ForbiddenException";



export class WorkTaskService implements IWorkTaskService
{
    private readonly _repositoryManager: IRepositoryManager;
    private readonly _mapperManager: IMapperManager;
    private readonly _userProvider: IUserProvider;

    constructor(coreAdapterManager: ICoreAdapterManager, mapperManager: IMapperManager, userProvider: IUserProvider)
    {
        this._repositoryManager = coreAdapterManager.repositoryManager;
        this._mapperManager = mapperManager;
        this._userProvider = userProvider;
    }

    private ExpectMinimumRole(role: Role): void
    {
        RoleAuthorizationGuard.assertMinimumRole(this._userProvider.getCurrentUser()?.role!, role);
    }

    private getCalledById(): number
    {
        const id = this._userProvider.getCurrentUser()?.userId;
        return id ? Number(id) : 0;
    }

    private getCalledByName(): string
    {
        const current = this._userProvider.getCurrentUser();
        return current?.name ?? "System";
    }

    private async GetWorkOrderDepartmentIdAndCheckIfItExists(workOrderId: number): Promise<number>
    {
        const departmentId = await this._repositoryManager.workOrderRepository.GetDepartmentIdByWorkOrderId(workOrderId);

        if (departmentId === null)
        {
            throw new WorkOrderNotFoundException(workOrderId);
        }

        return departmentId;
    }

    private async AssertAssigneeAllowedForWorkOrder(workOrderId: number, assigneeId: number): Promise<void>
    {
        const assignee = await this._repositoryManager.userRepository.GetUserById(assigneeId);

        if (!assignee)
        {
            throw new UserNotFoundException(assigneeId);
        }

        if (assignee.role.toLowerCase() === "admin")
        {
            throw new ForbiddenException("Admin users cannot be assigned to work tasks.");
        }

        const currentUser = this._userProvider.getCurrentUser();
        const actorRole = currentUser?.role.toLowerCase();

        if (
            actorRole === "manager" &&
            assignee.id !== currentUser?.userId &&
            assignee.role.toLowerCase() !== "employee"
        )
        {
            throw new ForbiddenException("A manager may only assign work tasks to employees or themselves.");
        }

        const workOrderDepartmentId = await this.GetWorkOrderDepartmentIdAndCheckIfItExists(workOrderId);

        if (assignee.departmentId === null || assignee.departmentId !== workOrderDepartmentId)
        {
            throw new UsersNotInSameDepartmentBadRequestException();
        }
    }

    private async GetWorkTaskAndCheckIfItExists(id: number): Promise<WorkTask>
    {
        const workTaskEntity = await this._repositoryManager.workTaskRepository.GetWorkTaskById(id);

        if (!workTaskEntity)
        {
            throw new WorkTaskNotFoundException(id);
        }

        return workTaskEntity;
    }

    async GetListWorkTask(parameters: WorkTaskParameter): Promise<PagedResult<WorkTaskDto>>
    {
        //this.ExpectRole('admin');

        const pagedWorkTasks = await this._repositoryManager.workTaskRepository.GetListWorkTask(parameters);

        return {
            items: pagedWorkTasks.items.map(task => this._mapperManager.workTaskMapper.WorkTaskToDto(task)),
            meta: pagedWorkTasks.meta
        };
    }

    async GetWorkTask(id: number): Promise<WorkTaskDto>
    {

        const workTask = await this.GetWorkTaskAndCheckIfItExists(id);

        return this._mapperManager.workTaskMapper.WorkTaskToDto(workTask);
    }

    async GetAssignmentHistory(id: number): Promise<WorkTaskAssignDto[]>
    {
        await this.GetWorkTaskAndCheckIfItExists(id);

        const assignmentHistory = await this._repositoryManager.workTaskRepository.GetAssignmentHistory(id);

        return assignmentHistory.map(assignment => this._mapperManager.workTaskMapper.WorkTaskAssignmentToDto(assignment));
    }

    async CreateWorkTask(workTaskForCreateDto: WorkTaskForCreateDto): Promise<WorkTaskDto>
    {
        this.ExpectMinimumRole('manager');

        await this.GetWorkOrderDepartmentIdAndCheckIfItExists(workTaskForCreateDto.workOrderId);

        const isExisting = await this._repositoryManager.workTaskRepository.CheckWorkTaskExistsByOrderId(workTaskForCreateDto.workOrderId);
        if (isExisting)
        {
            throw new WorkTaskAlreadyExistsBadRequestException(workTaskForCreateDto.workOrderId);
        }

        if (workTaskForCreateDto.assigneeId)
        {
            await this.AssertAssigneeAllowedForWorkOrder(workTaskForCreateDto.workOrderId, workTaskForCreateDto.assigneeId);
        }

        const newWorkTask: Partial<WorkTask> = {
            workOrderId: workTaskForCreateDto.workOrderId,
            description: workTaskForCreateDto.description,
            note: workTaskForCreateDto.note ?? null,
            startedAt: workTaskForCreateDto.startedAt ?? null,
            createdBy: this.getCalledByName(),
            updatedBy: this.getCalledByName(),
        };

        const createdTask = await this._repositoryManager.workTaskRepository.CreateWorkTask(
            newWorkTask,
            workTaskForCreateDto.assigneeId,
            workTaskForCreateDto.assigneeId ? this.getCalledById() : undefined 
        );
        return this._mapperManager.workTaskMapper.WorkTaskToDto(createdTask);
    }

    async UpdateWorkTask(id: number, workTaskForUpdateDto: WorkTaskForUpdateDto): Promise<WorkTaskDto>
    {
        this.ExpectMinimumRole('manager');

        const existingTask = await this.GetWorkTaskAndCheckIfItExists(id);

        if (existingTask.endedAt !== null && workTaskForUpdateDto.endedAt === undefined)
        {
            throw new WorkTaskAlreadyCompletedBadRequestException(id);
        }

        const updatedTaskData: Partial<WorkTask> = {
            id: existingTask.id,
            description: workTaskForUpdateDto.description ?? existingTask.description,
            note: workTaskForUpdateDto.note !== undefined ? workTaskForUpdateDto.note : existingTask.note,
            startedAt: workTaskForUpdateDto.startedAt === "" ? null :(workTaskForUpdateDto.startedAt !== undefined ? workTaskForUpdateDto.startedAt : existingTask.startedAt),
            endedAt: workTaskForUpdateDto.endedAt === "" ? null :(workTaskForUpdateDto.endedAt !== undefined ? workTaskForUpdateDto.endedAt : existingTask.endedAt),
            updatedBy: this.getCalledByName(),
        };

        const updatedTask = await this._repositoryManager.workTaskRepository.UpdateWorkTask(updatedTaskData);

        return this._mapperManager.workTaskMapper.WorkTaskToDto(updatedTask);
    }

    async AssignWorkTask(id: number, workTaskAssignForCreateDto: WorkTaskAssignForCreateDto): Promise<WorkTaskDto>
    {
        this.ExpectMinimumRole('manager');

        const existingTask = await this.GetWorkTaskAndCheckIfItExists(id);

        if (existingTask.endedAt !== null)
        {
            throw new WorkTaskAlreadyCompletedBadRequestException(id);
        }

        if (existingTask.assigneeId === workTaskAssignForCreateDto.assigneeId)
        {
            return this._mapperManager.workTaskMapper.WorkTaskToDto(existingTask);
        }

        await this.AssertAssigneeAllowedForWorkOrder(existingTask.workOrderId, workTaskAssignForCreateDto.assigneeId);

        await this._repositoryManager.workTaskRepository.AssignWorkTask(
            id,
            workTaskAssignForCreateDto.assigneeId,
            this.getCalledById(),
            this.getCalledByName()
        );

        const updatedTask = await this.GetWorkTaskAndCheckIfItExists(id);
        return this._mapperManager.workTaskMapper.WorkTaskToDto(updatedTask);
    }

    async UnassignWorkTask(id: number): Promise<WorkTaskDto>
    {
        this.ExpectMinimumRole('manager');

        const existingTask = await this.GetWorkTaskAndCheckIfItExists(id);

        if (existingTask.endedAt !== null)
        {
            throw new WorkTaskAlreadyCompletedBadRequestException(id);
        }
        


        await this._repositoryManager.workTaskRepository.UnassignWorkTask(id,this.getCalledByName());

        const updatedTask = await this.GetWorkTaskAndCheckIfItExists(id);
        return this._mapperManager.workTaskMapper.WorkTaskToDto(updatedTask);
    }

    async DeleteWorkTask(id: number): Promise<void>
    {
        this.ExpectMinimumRole('manager');

        await this.GetWorkTaskAndCheckIfItExists(id);

        await this._repositoryManager.workTaskRepository.DeleteWorkTask(id);
    }

    async DeleteWorkTaskCollection(ids: number[]): Promise<void>
    {
        for (const id of ids)
        {
            await this.DeleteWorkTask(id);
        }   
    }
}
