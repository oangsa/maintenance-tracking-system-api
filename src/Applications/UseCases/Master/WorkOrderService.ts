import { WorkOrderDto } from "../../DataTransferObjects/WorkOrder/WorkOrderDto";
import { WorkOrderForCreateDto } from "../../DataTransferObjects/WorkOrder/WorkOrderForCreateDto";
import { WorkOrderForUpdateDto } from "../../DataTransferObjects/WorkOrder/WorkOrderForUpdateDto";
import { WorkOrderParameter } from "../../../Domains/RequestFeatures/WorkOrderParameter";
import { PagedResult } from "../../../Domains/RequestFeatures/Core/PageResult";
import { IWorkOrderService } from "@/Applications/Services/IWorkOrderService";
import { IRepositoryManager } from "../../../Domains/Repositories/Core/IRepositoryManager";
import { IMapperManager } from "../../Mappers/Core/MapperManager";
import { IUserProvider } from "../../Providers/UserProvider";
import { ICoreAdapterManager } from "../CoreAdapterManager";
import { WorkOrderNotFoundException } from "../../../Domains/Exceptions/WorkOrder/WorkOrderNotFoundException";
import { WorkOrder } from "../../../Infrastructures/Entities/Master/WorkOrder";
import { WorkOrderSequenceDuplicateException } from "../../../Domains/Exceptions/WorkOrder/WorkOrderSequenceDuplicateException";
import { RoleAuthorizationGuard } from "../../../Shared/Utilities/Authentication/RoleAuthorizationGuard";
import { Role } from "../../../Shared/Enums/Role";


export class WorkOrderService implements IWorkOrderService
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

    private ExpectRole(role: Role): void
    {
        RoleAuthorizationGuard.assertExpectedRole(this._userProvider.getCurrentUser()?.role!, role);
    }

    private getCalledBy(): string
    {
        const current = this._userProvider.getCurrentUser();
        return current?.name ?? "System";
    }

    private async GetWorkOrderAndCheckIfItExists(id: number): Promise<WorkOrder>
    {
        const WorkOrderEntity = await this._repositoryManager.workOrderRepository.GetWorkOrderById(id);

        if (!WorkOrderEntity)
        {
            throw new WorkOrderNotFoundException(id);
        }

        return WorkOrderEntity;
    }

    async GetListWorkOrder(parameters: WorkOrderParameter): Promise<PagedResult<WorkOrderDto>>
    {
        // this.ExpectRole('admin');

        const pagedWorkOrders = await this._repositoryManager.workOrderRepository.GetListWorkOrder(parameters);

        return {
            items: pagedWorkOrders.items.map(WorkOrder => this._mapperManager.workOrderMapper.WorkOrderToDto(WorkOrder)),
            meta: pagedWorkOrders.meta,
        };
    }

    async GetListWorkOrderByRepairRequestId(repairRequestId: number, parameters: WorkOrderParameter): Promise<PagedResult<WorkOrderDto>>
    {
        // TODO: Consider allowing 'manager' or higher role to view work orders by repair request id
        // this.ExpectRole('admin');

        const pagedWorkOrders = await this._repositoryManager.workOrderRepository.GetListWorkOrderByRepairRequestId(repairRequestId, parameters);

        return {
            items: pagedWorkOrders.items.map(WorkOrder => this._mapperManager.workOrderMapper.WorkOrderToDto(WorkOrder)),
            meta: pagedWorkOrders.meta,
        };
    }

    async GetWorkOrder(id: number): Promise<WorkOrderDto>
    {
        const WorkOrderEntity = await this.GetWorkOrderAndCheckIfItExists(id);

        return this._mapperManager.workOrderMapper.WorkOrderToDto(WorkOrderEntity);
    }

    async CreateWorkOrder(WorkOrderForCreateDto: WorkOrderForCreateDto): Promise<WorkOrderDto>
    {
        // TODO: Consider allowing 'manager' or higher role to create work orders
        this.ExpectRole('admin');

        const isDuplicateSequence = await this._repositoryManager.workOrderRepository.CheckOrderSequenceExists(WorkOrderForCreateDto.repairRequestItemId, WorkOrderForCreateDto.orderSequence);

        if (isDuplicateSequence)
        {
            throw new WorkOrderSequenceDuplicateException(WorkOrderForCreateDto.repairRequestItemId, WorkOrderForCreateDto.orderSequence);
        }


        const dateNow = new Date().toISOString();

        const newWorkOrder: WorkOrder = {
            id: 0,
            repairRequestItemId: WorkOrderForCreateDto.repairRequestItemId,
            scheduledStart: WorkOrderForCreateDto.scheduledStart ?? "",
            scheduledEnd: WorkOrderForCreateDto.scheduledEnd ?? "",
            orderSequence: WorkOrderForCreateDto.orderSequence,
            isFinal: WorkOrderForCreateDto.isFinal ?? false,
            statusId: WorkOrderForCreateDto.statusId,
            createdAt: dateNow,
            updatedAt: dateNow,
            createdBy: this.getCalledBy(),
            updatedBy: this.getCalledBy(),

        };

        try
        {

            const createdWorkOrder = await this._repositoryManager.workOrderRepository.CreateWorkOrder(newWorkOrder);
            return this._mapperManager.workOrderMapper.WorkOrderToDto(createdWorkOrder);
        }
        catch (error: any)
        {
            if (error.code === "23505")
            {
                throw new WorkOrderSequenceDuplicateException(WorkOrderForCreateDto.repairRequestItemId, WorkOrderForCreateDto.orderSequence);
            }

            throw error;
        }

    }

    async UpdateWorkOrder(id: number, WorkOrderForUpdateDto: WorkOrderForUpdateDto): Promise<WorkOrderDto>
    {
        // TODO: Consider allowing 'manager' or higher role to update work orders
        this.ExpectRole('admin');

        const WorkOrderEntity = await this.GetWorkOrderAndCheckIfItExists(id);

        if (WorkOrderForUpdateDto.orderSequence !== undefined && WorkOrderForUpdateDto.orderSequence !== WorkOrderEntity.orderSequence)
        {
            const isDuplicateSequence = await this._repositoryManager.workOrderRepository.CheckOrderSequenceExists(WorkOrderForUpdateDto.repairRequestItemId ?? WorkOrderEntity.repairRequestItemId, WorkOrderForUpdateDto.orderSequence ?? WorkOrderEntity.orderSequence);

            if (isDuplicateSequence)
            {
                throw new WorkOrderSequenceDuplicateException(WorkOrderForUpdateDto.repairRequestItemId ?? WorkOrderEntity.repairRequestItemId, WorkOrderForUpdateDto.orderSequence ?? WorkOrderEntity.orderSequence);
            }
        }

        const updatedWorkOrder: WorkOrder = {
            ...WorkOrderEntity,
            repairRequestItemId: WorkOrderForUpdateDto.repairRequestItemId ?? WorkOrderEntity.repairRequestItemId,
            scheduledEnd: WorkOrderForUpdateDto.scheduledEnd ?? WorkOrderEntity.scheduledEnd,
            orderSequence: WorkOrderForUpdateDto.orderSequence ?? WorkOrderEntity.orderSequence,
            isFinal: WorkOrderForUpdateDto.isFinal ?? WorkOrderEntity.isFinal,
            statusId: WorkOrderForUpdateDto.statusId ?? WorkOrderEntity.statusId,
            updatedAt: new Date().toISOString(),
            updatedBy: this.getCalledBy(),
        };

        try
        {
            const result = await this._repositoryManager.workOrderRepository.UpdateWorkOrder(updatedWorkOrder);
            return this._mapperManager.workOrderMapper.WorkOrderToDto(result);
        }
        catch (error: any)
        {
            if (error.code === "23505")
            {
                throw new WorkOrderSequenceDuplicateException(WorkOrderForUpdateDto.repairRequestItemId ?? WorkOrderEntity.repairRequestItemId, WorkOrderForUpdateDto.orderSequence ?? WorkOrderEntity.orderSequence);
            }

            throw error;
        }
    }

    async DeleteWorkOrder(id: number): Promise<void>
    {
        // TODO: Consider allowing 'manager' or higher role to delete work orders
        this.ExpectRole('admin');

        await this.GetWorkOrderAndCheckIfItExists(id);
        await this._repositoryManager.workOrderRepository.DeleteWorkOrder(id);
    }

    async DeleteWorkOrderCollection(ids: number[]): Promise<void>
    {
        for (const id of ids)
        {
            await this.DeleteWorkOrder(id);
        }
    }
}
