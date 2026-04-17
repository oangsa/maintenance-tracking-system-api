import { RepairRequestDto } from "../DataTransferObjects/RepairRequest/RepairRequestDto";
import { RepairRequestItemDto } from "../DataTransferObjects/RepairRequest/RepairRequestItemDto";
import { RepairRequest } from "@/Infrastructures/Entities/Features/RepairRequest/RepairRequest";
import { RepairRequestItem } from "@/Infrastructures/Entities/Features/RepairRequest/RepairRequestItem";

export interface IRepairRequestMapper
{
    RepairRequestToDto(repairRequest: RepairRequest): RepairRequestDto;
    RepairRequestItemsToDto(items: RepairRequestItem[]): RepairRequestItemDto[];
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
}
