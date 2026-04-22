import { WorkOrderPartDto } from "../../DataTransferObjects/WorkOrderPart/WorkOrderPartDto";
import { WorkOrderPartForCreateDto } from "../../DataTransferObjects/WorkOrderPart/WorkOrderPartForCreateDto";
import { WorkOrderPartForUpdateDto } from "../../DataTransferObjects/WorkOrderPart/WorkOrderPartForUpdateDto";
import { WorkOrderPartParameter } from "../../../Domains/RequestFeatures/WorkOrderPartParameter";
import { PagedResult } from "../../../Domains/RequestFeatures/Core/PageResult";
import { IWorkOrderPartService } from "../../Services/IWorkOrderPartService";
import { IRepositoryManager } from "../../../Domains/Repositories/Core/IRepositoryManager";
import { IMapperManager } from "../../Mappers/Core/MapperManager";
import { IUserProvider } from "../../Providers/UserProvider";
import { ICoreAdapterManager } from "../CoreAdapterManager";
import { WorkOrderPart } from "../../../Infrastructures/Entities/Master/WorkOrderPart";
import { RoleAuthorizationGuard } from "../../../Shared/Utilities/Authentication/RoleAuthorizationGuard";
import { Role } from "../../../Shared/Enums/Role";
import { WorkOrderPartNotFoundException } from "../../../Domains/Exceptions/WorkOrderPart/WorkOrderPartNotFoundException";
import { WorkOrderPartDuplicateBadRequestException } from "../../../Domains/Exceptions/WorkOrderPart/WorkOrderPartDuplicateBadRequestException";
import { WorkOrderNotFoundException } from "../../../Domains/Exceptions/WorkOrder/WorkOrderNotFoundException";
import { WorkOrderPartAlreadyConsumedBadRequestException } from "@/Domains/Exceptions/WorkOrderPart/WorkOrderPartAlreadyConsumedBadRequestException";
import { PartNotFoundException } from "../../../Domains/Exceptions/Part/PartNotFoundException";

export class WorkOrderPartService implements IWorkOrderPartService
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

    private async GetWorkOrderPartAndCheckIfItExists(id: number): Promise<WorkOrderPart>
    {
        const workOrderPartEntity = await this._repositoryManager.workOrderPartRepository.GetWorkOrderPartById(id);

        if (!workOrderPartEntity)
        {
            throw new WorkOrderPartNotFoundException(id);
        }

        return workOrderPartEntity;
    }

    async GetListWorkOrderPart(parameters: WorkOrderPartParameter): Promise<PagedResult<WorkOrderPartDto>>
    {
        //this.ExpectRole('employee');

        const pagedWorkOrderParts = await this._repositoryManager.workOrderPartRepository.GetListWorkOrderPart(parameters);

        return {
            items: pagedWorkOrderParts.items.map(part => this._mapperManager.workOrderPartMapper.WorkOrderPartToDto(part)),
            meta: pagedWorkOrderParts.meta,
        };
    }

    async GetWorkOrderPart(id: number): Promise<WorkOrderPartDto>
    {
        //this.ExpectRole('employee');

        const workOrderPartEntity = await this.GetWorkOrderPartAndCheckIfItExists(id);

        return this._mapperManager.workOrderPartMapper.WorkOrderPartToDto(workOrderPartEntity);
    }

    async CreateWorkOrderPart(workOrderPartForCreateDto: WorkOrderPartForCreateDto): Promise<WorkOrderPartDto>
    {
        //this.ExpectRole('employee');

        const foundWorkOrder = await this._repositoryManager.workOrderRepository.GetWorkOrderById(workOrderPartForCreateDto.workOrderId);
        if (!foundWorkOrder) {
            throw new WorkOrderNotFoundException(workOrderPartForCreateDto.workOrderId);
        }

        const foundPart = await this._repositoryManager.partRepository.GetPartById(workOrderPartForCreateDto.partId);
        if (!foundPart) {
            throw new PartNotFoundException(workOrderPartForCreateDto.partId);
        }

        const dateNow = new Date().toISOString();

        const newWorkOrderPart: WorkOrderPart = {
            id: 0,
            workOrderId: workOrderPartForCreateDto.workOrderId,
            partId: workOrderPartForCreateDto.partId,
            partCode: foundPart.code,
            partName: foundPart.name,
            quantity: workOrderPartForCreateDto.quantity,
            note: workOrderPartForCreateDto.note ?? null,
            inventoryMoveItemId: null, 
            createdAt: dateNow,
            updatedAt: dateNow,
            createdBy: this.getCalledBy(),
            updatedBy: this.getCalledBy(),
            part: {
                id: foundPart.id,
                code: foundPart.code,
                name: foundPart.name
            }
        };

        try 
        {
            const createdWorkOrderPart = await this._repositoryManager.workOrderPartRepository.CreateWorkOrderPart(newWorkOrderPart);
        
            return this._mapperManager.workOrderPartMapper.WorkOrderPartToDto(createdWorkOrderPart);

        } 
        catch (error: any)
        {
            if (error.code === "23505")
            {
                throw new WorkOrderPartDuplicateBadRequestException(workOrderPartForCreateDto.partId);
            }
            throw error;
        }


    }

    async UpdateWorkOrderPart(id: number, workOrderPartForUpdateDto: WorkOrderPartForUpdateDto): Promise<WorkOrderPartDto>
    {
        //this.ExpectRole('employee');

        const workOrderPartEntity = await this.GetWorkOrderPartAndCheckIfItExists(id);

        if (workOrderPartEntity.inventoryMoveItemId !== null)
        {
            throw new WorkOrderPartAlreadyConsumedBadRequestException(id);
        }

        const updatedWorkOrderPart: WorkOrderPart = {
            ...workOrderPartEntity,
            quantity: workOrderPartForUpdateDto.quantity ?? workOrderPartEntity.quantity,
            note: workOrderPartForUpdateDto.note !== undefined ? workOrderPartForUpdateDto.note : workOrderPartEntity.note,
            updatedAt: new Date().toISOString(),
            updatedBy: this.getCalledBy(),
        };
        try
        {
            const result = await this._repositoryManager.workOrderPartRepository.UpdateWorkOrderPart(updatedWorkOrderPart);
            return this._mapperManager.workOrderPartMapper.WorkOrderPartToDto(result);
        }
        catch (error: any)
        {
            if (error.code === "23505")
            {
                throw new WorkOrderPartDuplicateBadRequestException(id);
            }
            throw error;
        }

    }

    async DeleteWorkOrderPart(id: number): Promise<void>
    {
        this.ExpectRole('admin'); 

        const workOrderPartEntity = await this.GetWorkOrderPartAndCheckIfItExists(id);

        if (workOrderPartEntity.inventoryMoveItemId !== null)
        {
            throw new WorkOrderPartAlreadyConsumedBadRequestException(id);
        }
        await this._repositoryManager.workOrderPartRepository.DeleteWorkOrderPart(id);
    }

    async DeleteWorkOrderPartCollection(ids: number[]): Promise<void>
    {
        for (const id of ids)
        {
            await this.DeleteWorkOrderPart(id);
        }
    }
}