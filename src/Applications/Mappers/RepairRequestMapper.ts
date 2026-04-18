import { RepairRequestDto } from "../DataTransferObjects/RepairRequest/RepairRequestDto";
import { RepairRequestItemDto } from "../DataTransferObjects/RepairRequestItem/RepairRequestItemDto";
import { RepairRequest } from "@/Infrastructures/Entities/Features/RepairRequest/RepairRequest";
import { RepairRequestItem } from "@/Infrastructures/Entities/Features/RepairRequest/RepairRequestItem";
import { RepairRequestItemForCreateDto } from "../DataTransferObjects/RepairRequestItem/RepairRequestItemForCreateDto";

export interface IRepairRequestMapper
{
    RepairRequestToDto(repairRequest: RepairRequest): RepairRequestDto;
    RepairRequestItemsToDto(items: RepairRequestItem[]): RepairRequestItemDto[];
    RepairRequestItemsDtoToRepairRequestItems(itemsDto: RepairRequestItemDto[]): RepairRequestItem[];
    RepairRequestItemForCreateDtoToRepairRequestItem(dto: RepairRequestItemForCreateDto): RepairRequestItem;
}

export class RepairRequestMapper implements IRepairRequestMapper
{
    private mapItem(item: RepairRequestItem): RepairRequestItemDto
    {
        return {
            id: item.id,
            repairRequestId: item.repairRequestId,
            productId: item.productId,
            productCode: item.product?.code ?? "",
            productName: item.product?.name ?? "",
            description: item.description,
            quantity: item.quantity,
            repairStatusId: item.repairStatusId ?? null,
            repairStatusCode: item.repairStatus?.code ?? null,
            repairStatusName: item.repairStatus?.name ?? null,
            departmentId: item.departmentId,
        };
    }

    private mapItemDtoToRepairRequestItem(dto: RepairRequestItemDto): RepairRequestItem
    {
        return {
            id: dto.id,
            repairRequestId: dto.repairRequestId,
            productId: dto.productId,
            description: dto.description,
            quantity: dto.quantity,
            repairStatusId: dto.repairStatusId ?? null,
            departmentId: dto.departmentId,
            createdAt: null,
            updatedAt: null,
            createdBy: null,
            updatedBy: null,
            product: null,
            repairStatus: null,
        }
    }

    RepairRequestToDto(repairRequest: RepairRequest): RepairRequestDto
    {
        return {
            id: repairRequest.id,
            requestNo: repairRequest.requestNo,
            requesterId: repairRequest.requesterId,
            requesterName: repairRequest.requester?.name ?? null,
            requesterEmail: repairRequest.requester?.email ?? "",
            priority: repairRequest.priority,
            requestedAt: repairRequest.requestedAt,
            currentStatusId: repairRequest.currentStatusId,
            currentStatusCode: repairRequest.currentStatus?.code ?? "",
            currentStatusName: repairRequest.currentStatus?.name ?? "",
            createdAt: repairRequest.createdAt,
            updatedAt: repairRequest.updatedAt,
            createdBy: repairRequest.createdBy,
            updatedBy: repairRequest.updatedBy,
            items: repairRequest.requestedItems.map(item => this.mapItem(item)),
        };
    }

    RepairRequestItemsToDto(items: RepairRequestItem[]): RepairRequestItemDto[]
    {
        return items.map(item => this.mapItem(item));
    }

    RepairRequestItemsDtoToRepairRequestItems(itemsDto: RepairRequestItemDto[]): RepairRequestItem[]
    {
        return itemsDto.map(dto => this.mapItemDtoToRepairRequestItem(dto));
    }

    RepairRequestItemForCreateDtoToRepairRequestItem(dto: RepairRequestItemForCreateDto): RepairRequestItem
    {
        return {
            id: 0,
            repairRequestId: 0,
            productId: dto.productId,
            description: dto.description,
            quantity: dto.quantity,
            repairStatusId: null,
            departmentId: dto.departmentId,
            createdAt: null,
            updatedAt: null,
            createdBy: null,
            updatedBy: null,
            product: null,
            repairStatus: null,
        }
    }
}
