import { RepairRequestItemStatusDto } from "../../DataTransferObjects/RepairRequestItemStatus/RepairRequestItemStatusDto";
import { RepairRequestItemStatusForCreateDto } from "../../DataTransferObjects/RepairRequestItemStatus/RepairRequestItemStatusForCreateDto";
import { RepairRequestItemStatusForUpdateDto } from "../../DataTransferObjects/RepairRequestItemStatus/RepairRequestItemStatusForUpdateDto";
import { RepairRequestItemStatusParameter } from "../../../Domains/RequestFeatures/RepairRequestItemStatusParameter";
import { PagedResult } from "../../../Domains/RequestFeatures/Core/PageResult";
import { IRepairRequestItemStatusService } from "../../Services/IRepairRequestItemStatusService";
import { IRepositoryManager } from "../../../Domains/Repositories/Core/IRepositoryManager";
import { IMapperManager } from "../../Mappers/Core/MapperManager";
import { IUserProvider } from "../../Providers/UserProvider";
import { ICoreAdapterManager } from "../CoreAdapterManager";
import { RepairRequestItemStatusNotFoundException } from "../../../Domains/Exceptions/RepairRequest/RepairRequestItemStatusNotFoundException";
import { RepairRequestItemStatus } from "../../../Infrastructures/Entities/Master/RepairRequestItemStatus";
import { RepairRequestItemStatusDuplicateBadRequestException } from "../../../Domains/Exceptions/RepairRequest/RepairRequestItemStatusDuplicateBadRequestException";
import { RoleAuthorizationGuard } from "../../../Shared/Utilities/Authentication/RoleAuthorizationGuard";
import { Role } from "../../../Shared/Enums/Role";

export class RepairRequestItemStatusService implements IRepairRequestItemStatusService
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

    private async GetRepairRequestItemStatusAndCheckIfItExists(id: number): Promise<RepairRequestItemStatus>
    {
        const repairRequestItemStatusEntity = await this._repositoryManager.repairRequestItemStatusRepository.GetRepairRequestItemStatusById(id);

        if (!repairRequestItemStatusEntity)
        {
            throw new RepairRequestItemStatusNotFoundException(id);
        }

        return repairRequestItemStatusEntity;
    }

    async GetListRepairRequestItemStatus(parameters: RepairRequestItemStatusParameter): Promise<PagedResult<RepairRequestItemStatusDto>>
    {
        this.ExpectRole("admin");

        const pagedRepairRequestItemStatuses = await this._repositoryManager.repairRequestItemStatusRepository.GetListRepairRequestItemStatus(parameters);

        return {
            items: pagedRepairRequestItemStatuses.items.map((repairRequestItemStatus) => this._mapperManager.repairRequestItemStatusMapper.RepairRequestItemStatusToDto(repairRequestItemStatus)),
            meta: pagedRepairRequestItemStatuses.meta,
        };
    }

    async GetRepairRequestItemStatus(id: number): Promise<RepairRequestItemStatusDto>
    {
        const repairRequestItemStatusEntity = await this.GetRepairRequestItemStatusAndCheckIfItExists(id);

        return this._mapperManager.repairRequestItemStatusMapper.RepairRequestItemStatusToDto(repairRequestItemStatusEntity);
    }

    async CreateRepairRequestItemStatus(repairRequestItemStatusForCreateDto: RepairRequestItemStatusForCreateDto): Promise<RepairRequestItemStatusDto>
    {
        this.ExpectRole("admin");

        const existingRepairRequestItemStatus = await this._repositoryManager.repairRequestItemStatusRepository.GetRepairRequestItemStatusByCode(repairRequestItemStatusForCreateDto.code, true);

        if (existingRepairRequestItemStatus && !existingRepairRequestItemStatus.deleted)
        {
            throw new RepairRequestItemStatusDuplicateBadRequestException(repairRequestItemStatusForCreateDto.code);
        }

        const dateNow = new Date().toISOString();

        const newRepairRequestItemStatus: RepairRequestItemStatus = {
            id: 0,
            code: repairRequestItemStatusForCreateDto.code,
            name: repairRequestItemStatusForCreateDto.name,
            orderSequence: repairRequestItemStatusForCreateDto.orderSequence,
            isFinal: repairRequestItemStatusForCreateDto.isFinal ?? false,
            createdAt: dateNow,
            updatedAt: dateNow,
            createdBy: this.getCalledBy(),
            updatedBy: this.getCalledBy(),
            deleted: false,
        };

        try
        {
            if (existingRepairRequestItemStatus && existingRepairRequestItemStatus.deleted)
            {
                const restoredRepairRequestItemStatus = await this._repositoryManager.repairRequestItemStatusRepository.UpdateRepairRequestItemStatus({
                    ...existingRepairRequestItemStatus,
                    ...newRepairRequestItemStatus,
                    id: existingRepairRequestItemStatus.id,
                    deleted: false,
                });

                return this._mapperManager.repairRequestItemStatusMapper.RepairRequestItemStatusToDto(restoredRepairRequestItemStatus);
            }

            const createdRepairRequestItemStatus = await this._repositoryManager.repairRequestItemStatusRepository.CreateRepairRequestItemStatus(newRepairRequestItemStatus);
            return this._mapperManager.repairRequestItemStatusMapper.RepairRequestItemStatusToDto(createdRepairRequestItemStatus);
        }
        catch (error: any)
        {
            if (error.code === "23505")
            {
                throw new RepairRequestItemStatusDuplicateBadRequestException(repairRequestItemStatusForCreateDto.code);
            }

            throw error;
        }
    }

    async UpdateRepairRequestItemStatus(id: number, repairRequestItemStatusForUpdateDto: RepairRequestItemStatusForUpdateDto): Promise<RepairRequestItemStatusDto>
    {
        this.ExpectRole("admin");

        const repairRequestItemStatusEntity = await this.GetRepairRequestItemStatusAndCheckIfItExists(id);

        if (repairRequestItemStatusForUpdateDto.code)
        {
            const existingRepairRequestItemStatusWithCode = await this._repositoryManager.repairRequestItemStatusRepository.GetRepairRequestItemStatusByCode(repairRequestItemStatusForUpdateDto.code, false);

            if (existingRepairRequestItemStatusWithCode && existingRepairRequestItemStatusWithCode.id !== id && !existingRepairRequestItemStatusWithCode.deleted)
            {
                throw new RepairRequestItemStatusDuplicateBadRequestException(repairRequestItemStatusForUpdateDto.code);
            }
        }

        const updatedRepairRequestItemStatus: RepairRequestItemStatus = {
            ...repairRequestItemStatusEntity,
            code: repairRequestItemStatusForUpdateDto.code ?? repairRequestItemStatusEntity.code,
            name: repairRequestItemStatusForUpdateDto.name ?? repairRequestItemStatusEntity.name,
            orderSequence: repairRequestItemStatusForUpdateDto.orderSequence ?? repairRequestItemStatusEntity.orderSequence,
            isFinal: repairRequestItemStatusForUpdateDto.isFinal ?? repairRequestItemStatusEntity.isFinal,
            updatedAt: new Date().toISOString(),
            updatedBy: this.getCalledBy(),
        };

        try
        {
            const result = await this._repositoryManager.repairRequestItemStatusRepository.UpdateRepairRequestItemStatus(updatedRepairRequestItemStatus);
            return this._mapperManager.repairRequestItemStatusMapper.RepairRequestItemStatusToDto(result);
        }
        catch (error: any)
        {
            if (error.code === "23505")
            {
                throw new RepairRequestItemStatusDuplicateBadRequestException(repairRequestItemStatusForUpdateDto.code!);
            }

            throw error;
        }
    }

    async DeleteRepairRequestItemStatus(id: number): Promise<void>
    {
        this.ExpectRole("admin");

        await this.GetRepairRequestItemStatusAndCheckIfItExists(id);
        await this._repositoryManager.repairRequestItemStatusRepository.DeleteRepairRequestItemStatus(id);
    }

    async DeleteRepairRequestItemStatusCollection(ids: number[]): Promise<void>
    {
        for (const id of ids)
        {
            await this.DeleteRepairRequestItemStatus(id);
        }
    }
}
