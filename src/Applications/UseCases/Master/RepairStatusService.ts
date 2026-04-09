import { RepairStatusDto } from "../../DataTransferObjects/RepairStatus/RepairStatusDto";
import { RepairStatusForCreateDto } from "../../DataTransferObjects/RepairStatus/RepairStatusForCreateDto";
import { RepairStatusForUpdateDto } from "../../DataTransferObjects/RepairStatus/RepairStatusForUpdateDto";
import { RepairStatusParameter } from "../../../Domains/RequestFeatures/RepairStatusParameter";
import { PagedResult } from "../../../Domains/RequestFeatures/Core/PageResult";
import { IRepairStatusService } from "../../Services/IRepairStatusService";
import { IRepositoryManager } from "../../../Domains/Repositories/Core/IRepositoryManager";
import { IMapperManager } from "../../Mappers/Core/MapperManager";
import { IUserProvider } from "../../Providers/UserProvider";
import { ICoreAdapterManager } from "../CoreAdapterManager";
import { RepairStatusNotFoundException } from "../../../Domains/Exceptions/RepairStatus/RepairStatusNotFoundException";
import { RepairStatus } from "../../../Infrastructures/Entities/Master/RepairStatus";
import { RepairStatusDuplicateBadRequestException } from "../../../Domains/Exceptions/RepairStatus/RepairStatusDuplicateBadRequestException";
import { RoleAuthorizationGuard } from "../../../Shared/Utilities/Authentication/RoleAuthorizationGuard";

export class RepairStatusService implements IRepairStatusService
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

    private ExpectRole(role: string): void
    {
        RoleAuthorizationGuard.assertExpectedRole(this._userProvider.getCurrentUser()?.role!, role as any);
    }

    private getCalledBy(): string
    {
        const current = this._userProvider.getCurrentUser();
        return current?.name ?? "System";
    }

    private async GetRepairStatusAndCheckIfItExists(id: number): Promise<RepairStatus>
    {
        const entity = await this._repositoryManager.repairStatusRepository.GetRepairStatusById(id);

        if (!entity)
        {
            throw new RepairStatusNotFoundException(id);
        }

        return entity;
    }

    async GetListRepairStatus(parameters: RepairStatusParameter): Promise<PagedResult<RepairStatusDto>>
    {
        this.ExpectRole('admin');

        const pagedData = await this._repositoryManager.repairStatusRepository.GetListRepairStatus(parameters);

        return {
            items: pagedData.items.map(item => this._mapperManager.repairStatusMapper.RepairStatusToDto(item)),
            meta: pagedData.meta,
        };
    }

    async GetRepairStatus(id: number): Promise<RepairStatusDto>
    {
        const entity = await this.GetRepairStatusAndCheckIfItExists(id);
        return this._mapperManager.repairStatusMapper.RepairStatusToDto(entity);
    }

    async CreateRepairStatus(dto: RepairStatusForCreateDto): Promise<RepairStatusDto>
    {
        this.ExpectRole('admin');

        //ตรวจสอบว่ามี Code นี้อยู่แล้วหรือไม่ (รวมที่ลบไปแล้ว)
        const existing = await this._repositoryManager.repairStatusRepository.GetRepairStatusByCode(dto.code, true);

        if (existing && !existing.deleted)
        {
            throw new RepairStatusDuplicateBadRequestException(dto.code);
        }

        const dateNow = new Date().toISOString();
        const newEntity: RepairStatus = {
            id: 0,
            code: dto.code,
            name: dto.name,
            orderSequence: dto.orderSequence,
            isFinal: dto.isFinal,
            createdAt: dateNow,
            updatedAt: dateNow,
            createdBy: this.getCalledBy(),
            updatedBy: this.getCalledBy(),
            deleted: false,
        };

        try
        {
            //ถ้าเคยมีแต่ถูกลบไปแล้ว ให้ทำการ Restore (Update กลับมา)
            if (existing && existing.deleted)
            {
                const restored = await this._repositoryManager.repairStatusRepository.UpdateRepairStatus({
                    ...existing,
                    ...newEntity,
                    id: existing.id,
                    deleted: false,
                } as any);

                return this._mapperManager.repairStatusMapper.RepairStatusToDto(restored);
            }

            //ถ้าไม่เคยมีเลย ให้สร้างใหม่
            const created = await this._repositoryManager.repairStatusRepository.CreateRepairStatus(newEntity);
            return this._mapperManager.repairStatusMapper.RepairStatusToDto(created);
        }
        catch (error: any)
        {
            if (error.code === "23505") // Unique violation
            {
                throw new RepairStatusDuplicateBadRequestException(dto.code);
            }
            throw error;
        }
    }

    async UpdateRepairStatus(id: number, dto: RepairStatusForUpdateDto): Promise<RepairStatusDto>
    {
        this.ExpectRole('admin');

        const entity = await this.GetRepairStatusAndCheckIfItExists(id);

        //ตรวจสอบเรื่อง Code ซ้ำถ้ามีการเปลี่ยน Code
        if (dto.code)
        {
            const existingWithCode = await this._repositoryManager.repairStatusRepository.GetRepairStatusByCode(dto.code, false);

            if (existingWithCode && existingWithCode.id !== id)
            {
                throw new RepairStatusDuplicateBadRequestException(dto.code);
            }
        }

        const updatedEntity: RepairStatus = {
            ...entity,
            code: dto.code ?? entity.code,
            name: dto.name ?? entity.name,
            orderSequence: dto.orderSequence ?? entity.orderSequence,
            isFinal: dto.isFinal ?? entity.isFinal,
            updatedAt: new Date().toISOString(),
            updatedBy: this.getCalledBy(),
        };

        try
        {
            const result = await this._repositoryManager.repairStatusRepository.UpdateRepairStatus(updatedEntity);
            return this._mapperManager.repairStatusMapper.RepairStatusToDto(result);
        }
        catch (error: any)
        {
            if (error.code === "23505")
            {
                throw new RepairStatusDuplicateBadRequestException(dto.code!);
            }
            throw error;
        }
    }

    async DeleteRepairStatus(id: number): Promise<void>
    {
        this.ExpectRole('admin');

        await this.GetRepairStatusAndCheckIfItExists(id);
        await this._repositoryManager.repairStatusRepository.DeleteRepairStatus(id);
    }
}