import { RepairRequestDto } from "../../../DataTransferObjects/RepairRequest/RepairRequestDto";
import { RepairRequestItemDto } from "../../../DataTransferObjects/RepairRequest/RepairRequestItemDto";
import { RepairRequestForCreateDto } from "../../../DataTransferObjects/RepairRequest/RepairRequestForCreateDto";
import { RepairRequestForUpdateDto } from "../../../DataTransferObjects/RepairRequest/RepairRequestForUpdateDto";
import { RepairRequestStatusLogDto } from "../../../DataTransferObjects/RepairRequest/RepairRequestStatusLogDto";
import { RepairRequestParameter } from "../../../../Domains/RequestFeatures/RepairRequestParameter";
import { PagedResult } from "@/Domains/RequestFeatures/Core/PageResult";
import { IRepairRequestService } from "@/Applications/Services/IRepairRequestService";
import { IRepositoryManager } from "@/Domains/Repositories/Core/IRepositoryManager";
import { IMapperManager } from "../../../Mappers/Core/MapperManager";
import { IUserProvider } from "../../../Providers/UserProvider";
import { ICoreAdapterManager } from "../../CoreAdapterManager";
import { RepairRequestNotFoundException } from "@/Domains/Exceptions/RepairRequest/RepairRequestNotFoundException";
import { ForbiddenException } from "@/Domains/Exceptions/ForbiddenException";
import { RepairRequest } from "@/Infrastructures/Entities/Features/RepairRequest/RepairRequest";
import { RepairRequestItem } from "@/Infrastructures/Entities/Features/RepairRequest/RepairRequestItem";

export class RepairRequestService implements IRepairRequestService
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

    private getCalledBy(): string
    {
        const current = this._userProvider.getCurrentUser();
        return current?.name ?? "System";
    }

    private assertManagerOrAdmin(): void
    {
        const role = this._userProvider.getCurrentUser()?.role?.toLowerCase();

        if (role !== "admin" && role !== "manager")
        {
            throw new ForbiddenException(`A '${role}' is not allowed to perform this action.`);
        }
    }

    private generateRequestNo(): string
    {
        const now = new Date();
        const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
        const randomStr = Math.floor(Math.random() * 100000).toString().padStart(5, "0");

        return `RR-${dateStr}-${randomStr}`;
    }

    private async GetRepairRequestAndCheckIfItExists(id: number): Promise<RepairRequest>
    {
        const entity = await this._repositoryManager.repairRequestRepository.GetRepairRequestById(id);

        if (!entity)
        {
            throw new RepairRequestNotFoundException(id);
        }

        return entity;
    }

    async GetListRepairRequest(parameters: RepairRequestParameter): Promise<PagedResult<RepairRequestDto>>
    {
        const pagedData = await this._repositoryManager.repairRequestRepository.GetListRepairRequest(parameters);

        return {
            items: pagedData.items.map(item => this._mapperManager.repairRequestMapper.RepairRequestToDto(item)),
            meta: pagedData.meta,
        };
    }

    async GetRepairRequest(id: number): Promise<RepairRequestDto>
    {
        const entity = await this.GetRepairRequestAndCheckIfItExists(id);
        return this._mapperManager.repairRequestMapper.RepairRequestToDto(entity);
    }

    async GetRepairRequestItems(id: number): Promise<RepairRequestItemDto[]>
    {
        await this.GetRepairRequestAndCheckIfItExists(id);
        const items = await this._repositoryManager.repairRequestRepository.GetRepairRequestItemsByRequestId(id);
        return this._mapperManager.repairRequestMapper.RepairRequestItemsToDto(items);
    }

    async GetRepairRequestAudits(id: number): Promise<RepairRequestStatusLogDto[]>
    {
        await this.GetRepairRequestAndCheckIfItExists(id);
        const logs = await this._repositoryManager.repairRequestStatusLogRepository.GetStatusLogsByRepairRequestId(id);
        return logs.map(log => this._mapperManager.repairRequestStatusLogMapper.RepairRequestStatusLogToDto(log));
    }

    async CreateRepairRequest(dto: RepairRequestForCreateDto): Promise<RepairRequestDto>
    {
        const currentUser = this._userProvider.getCurrentUser();
        const dateNow = new Date().toISOString();

        const items: RepairRequestItem[] = dto.items.map(item => ({
            id: 0,
            repairRequestId: 0,
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            repairStatusId: 1,
            departmentId: item.departmentId,
            createdAt: dateNow,
            updatedAt: dateNow,
            createdBy: this.getCalledBy(),
            updatedBy: this.getCalledBy(),
            product: null,
            repairStatus: null,
        }));

        const newRepairRequest: RepairRequest = {
            id: 0,
            requestNo: this.generateRequestNo(),
            requesterId: currentUser!.userId,
            priority: dto.priority,
            requestedAt: dateNow,
            currentStatusId: dto.currentStatusId,
            createdAt: dateNow,
            updatedAt: dateNow,
            createdBy: this.getCalledBy(),
            updatedBy: this.getCalledBy(),
            currentStatus: null,
            requester: null,
            requestedItems: items,
        };

        const created = await this._repositoryManager.repairRequestRepository.CreateRepairRequest(newRepairRequest);
        return this._mapperManager.repairRequestMapper.RepairRequestToDto(created);
    }

    async UpdateRepairRequest(id: number, dto: RepairRequestForUpdateDto): Promise<RepairRequestDto>
    {
        this.assertManagerOrAdmin();

        const entity = await this.GetRepairRequestAndCheckIfItExists(id);
        const dateNow = new Date().toISOString();
        const statusChanged = dto.currentStatusId !== undefined && dto.currentStatusId !== entity.currentStatusId;

        const updatedEntity: Partial<RepairRequest> = {
            id: entity.id,
            priority: dto.priority ?? entity.priority,
            currentStatusId: dto.currentStatusId ?? entity.currentStatusId,
            updatedAt: dateNow,
            updatedBy: this.getCalledBy(),
        };

        const result = await this._repositoryManager.repairRequestRepository.UpdateRepairRequest(updatedEntity);

        if (statusChanged)
        {
            const currentUser = this._userProvider.getCurrentUser();

            await this._repositoryManager.repairRequestStatusLogRepository.CreateStatusLog({
                repairRequestId: entity.id,
                oldStatusId: entity.currentStatusId,
                newStatusId: dto.currentStatusId!,
                changedBy: currentUser?.userId ?? null,
                note: null,
                changedAt: dateNow,
                createdAt: dateNow,
                updatedAt: dateNow,
                createdBy: this.getCalledBy(),
                updatedBy: this.getCalledBy(),
            });
        }

        return this._mapperManager.repairRequestMapper.RepairRequestToDto(result);
    }

    async DeleteRepairRequest(id: number): Promise<void>
    {
        const role = this._userProvider.getCurrentUser()?.role?.toLowerCase();

        if (role !== "admin")
        {
            throw new ForbiddenException(`A '${role}' is not allowed to perform this action.`);
        }

        await this.GetRepairRequestAndCheckIfItExists(id);
        await this._repositoryManager.repairRequestRepository.DeleteRepairRequest(id);
    }

    async DeleteRepairRequestCollection(ids: number[]): Promise<void>
    {
        const role = this._userProvider.getCurrentUser()?.role?.toLowerCase();

        if (role !== "admin")
        {
            throw new ForbiddenException(`A '${role}' is not allowed to perform this action.`);
        }

        for (const id of ids)
        {
            await this.DeleteRepairRequest(id);
        }
    }
}
