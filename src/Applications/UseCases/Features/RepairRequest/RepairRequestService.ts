import { RepairRequestDto } from "../../../DataTransferObjects/RepairRequest/RepairRequestDto";
import { RepairRequestItemDto } from "../../../DataTransferObjects/RepairRequestItem/RepairRequestItemDto";
import { RepairRequestForCreateDto } from "../../../DataTransferObjects/RepairRequest/RepairRequestForCreateDto";
import { RepairRequestForUpdateDto } from "../../../DataTransferObjects/RepairRequest/RepairRequestForUpdateDto";
import { RepairRequestStatusLogDto } from "../../../DataTransferObjects/RepairRequest/RepairRequestStatusLogDto";
import { RepairRequestParameter } from "../../../../Domains/RequestFeatures/RepairRequestParameter";
import { RepairRequestItemParameter } from "../../../../Domains/RequestFeatures/RepairRequestItemParameter";
import { PagedResult } from "@/Domains/RequestFeatures/Core/PageResult";
import { IRepairRequestService } from "@/Applications/Services/IRepairRequestService";
import { IRepositoryManager } from "@/Domains/Repositories/Core/IRepositoryManager";
import { IMapperManager } from "../../../Mappers/Core/MapperManager";
import { IUserProvider } from "../../../Providers/UserProvider";
import { ICoreAdapterManager } from "../../CoreAdapterManager";
import { RepairRequestNotFoundException } from "@/Domains/Exceptions/RepairRequest/RepairRequestNotFoundException";
import { ForbiddenException } from "@/Domains/Exceptions/ForbiddenException";
import { BadRequestMessageException } from "@/Domains/Exceptions/BadRequestException";
import { RepairRequest } from "@/Infrastructures/Entities/Features/RepairRequest/RepairRequest";
import { RepairRequestItem } from "@/Infrastructures/Entities/Features/RepairRequest/RepairRequestItem";
import { RepairRequestItemForCreateDto } from "@/Applications/DataTransferObjects/RepairRequestItem/RepairRequestItemForCreateDto";
import { RepairRequestCountGroupByStatusDto } from "@/Applications/DataTransferObjects/RepairRequest/RepairRequestCountGroupByStatusDto";
import { DateVerification, IDateVerification } from "@/Shared/Utilities/DateVerification/DateVerification";
import { TopRepairedProductsPerformanceReportDto } from "@/Applications/DataTransferObjects/RepairRequest/TopRepairedProductsPerformanceReportDto";
import { MonthlyRepairTrendByProductTypeReport } from "@/Applications/DataTransferObjects/RepairRequest/MonthlyRepairTrendByProductTypeReportDto";


export class RepairRequestService implements IRepairRequestService
{
    private readonly _repositoryManager: IRepositoryManager;
    private readonly _mapperManager: IMapperManager;
    private readonly _userProvider: IUserProvider;
    private readonly _dateVerification: IDateVerification;

    constructor(coreAdapterManager: ICoreAdapterManager, mapperManager: IMapperManager, userProvider: IUserProvider)
    {
        this._repositoryManager = coreAdapterManager.repositoryManager;
        this._mapperManager = mapperManager;
        this._userProvider = userProvider;
        this._dateVerification = new DateVerification();
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

    private ValidateRequestedAtDateRange(parameters: RepairRequestParameter): void
    {
        const searches = parameters.search ?? [];
        const requestedAtSearches = searches.filter(search => search.name?.toLowerCase() === "requested_at");
        const lowerBoundConditions = ["GREATER", "GREATEROREQUAL"];
        const upperBoundConditions = ["LESSER", "LESSEROREQUAL"];

        const lowerBoundSearch = requestedAtSearches.find(search =>
            lowerBoundConditions.includes((search.condition ?? "").toUpperCase()),
        );
        const upperBoundSearch = requestedAtSearches.find(search =>
            upperBoundConditions.includes((search.condition ?? "").toUpperCase()),
        );

        if (!lowerBoundSearch?.value && !upperBoundSearch?.value)
        {
            return;
        }

        if (lowerBoundSearch?.value && !this._dateVerification.IsValidDate(lowerBoundSearch.value))
        {
            throw new BadRequestMessageException( "Invalid requested_at date format. Use a valid ISO-8601 datetime value.",);
        }

        if (upperBoundSearch?.value && !this._dateVerification.IsValidDate(upperBoundSearch.value))
        {
            throw new BadRequestMessageException( "Invalid requested_at date format. Use a valid ISO-8601 datetime value.",);
        }

        if (!lowerBoundSearch?.value || !upperBoundSearch?.value)
        {
            return;
        }

        if (!this._dateVerification.IsValidDateRange(lowerBoundSearch.value, upperBoundSearch.value))
        {
            throw new BadRequestMessageException( "Invalid requested_at date range. Lower bound must be less than or equal to upper bound.",);
        }
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

    async GetRepairRequestItems(id: number, parameters: RepairRequestItemParameter): Promise<PagedResult<RepairRequestItemDto>>
    {
        await this.GetRepairRequestAndCheckIfItExists(id);
        const pagedData = await this._repositoryManager.repairRequestRepository.GetListRepairRequestItemsByRequestId(id, parameters);

        return {
            items: this._mapperManager.repairRequestMapper.RepairRequestItemsToDto(pagedData.items),
            meta: pagedData.meta,
        };
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

    async CreateRepairRequestItems(repairRequestId: number, dtos: RepairRequestItemForCreateDto[]): Promise<RepairRequestItemDto[]>
    {
        await this.GetRepairRequestAndCheckIfItExists(repairRequestId);

        const dateNow = new Date().toISOString();

        const items: RepairRequestItem[] = dtos.map(dto => this._mapperManager.repairRequestMapper.RepairRequestItemForCreateDtoToRepairRequestItem(dto));

        items.forEach(item => {
            item.repairRequestId = repairRequestId;
            item.repairStatusId = 1;
            item.createdAt = dateNow;
            item.updatedAt = dateNow;
            item.createdBy = this.getCalledBy();
            item.updatedBy = this.getCalledBy();
        });

        const createdItems = await this._repositoryManager.repairRequestRepository.CreateRepairRequestItems(repairRequestId, items);
        return this._mapperManager.repairRequestMapper.RepairRequestItemsToDto(createdItems);
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

    async GetRepairRequestCountGroupByStatus(parameters: RepairRequestParameter): Promise<PagedResult<RepairRequestCountGroupByStatusDto>>
    {
        this.ValidateRequestedAtDateRange(parameters);

        const pagedData = await this._repositoryManager.repairRequestRepository.GetRepairRequestCountGroupByStatus(parameters);

        return {
            items: pagedData.items.map(item => this._mapperManager.repairRequestMapper.RepairRequestCountGroupByStatusToDto(item)),
            meta: pagedData.meta,
        };
    }

    async GetTopRepairedProductsPerformanceReport(parameters: RepairRequestParameter): Promise<TopRepairedProductsPerformanceReportDto[]> {
        const searches = parameters.search ?? [];
        const requestedAtFilters = searches.filter(s => s.name?.toLowerCase() === "requested_at");

        const lowerBoundConditions = ["GREATER", "GREATEROREQUAL"];
        const upperBoundConditions = ["LESSER", "LESSEROREQUAL"];

        const lowerBound = requestedAtFilters.find(f =>
            lowerBoundConditions.includes((f.condition ?? "").toUpperCase())
        );
        const upperBound = requestedAtFilters.find(f =>
            upperBoundConditions.includes((f.condition ?? "").toUpperCase())
        );

        if (!lowerBound?.value || !upperBound?.value) {
            throw new BadRequestMessageException("Date range (requested_at) is required with both lower and upper bounds for this report.");
        }

        this.ValidateRequestedAtDateRange(parameters);

        return await this._repositoryManager.repairRequestRepository.GetTopRepairedProductsPerformanceReport(parameters);
    }

    public async GetMonthlyRepairTrendByProductTypeReport(parameters: RepairRequestParameter): Promise<MonthlyRepairTrendByProductTypeReport[]> {
        const searches = parameters.search || [];

        const startDateSearch = searches.find(s => s.name === 'requested_at' && s.condition === 'GREATEROREQUAL');
        const endDateSearch = searches.find(s => s.name === 'requested_at' && s.condition === 'LESSEROREQUAL');

        if (!startDateSearch || !startDateSearch.value || !endDateSearch || !endDateSearch.value) {
            throw new BadRequestMessageException("Date range (requested_at) is required with GREATEROREQUAL and LESSEROREQUAL conditions.");
        }

        let startDate = new Date(startDateSearch.value);
        let endDate = new Date(endDateSearch.value);

        if (startDateSearch.value.length <= 10) {
            const [y = 0, m = 1, d = 1] = startDateSearch.value.split('-').map(Number);
            startDate = new Date(y, m - 1, d, 0, 0, 0, 0);
        }

        if (endDateSearch.value.length <= 10) {
            const [y = 0, m = 1, d = 1] = endDateSearch.value.split('-').map(Number);
            endDate = new Date(y, m - 1, d, 23, 59, 59, 999);
        }

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new BadRequestMessageException("Invalid date format provided for requested_at.");
        }

        if (startDate > endDate) {
            throw new BadRequestMessageException("Start date cannot be greater than end date.");
        }

        return await this._repositoryManager.repairRequestRepository.GetMonthlyRepairTrendByProductTypeReport(startDate, endDate);
    }
}
