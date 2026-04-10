import { RepairRequestDto } from "../DataTransferObjects/RepairRequest/RepairRequestDto";
import { RepairRequest } from "@/Infrastructures/Entities/Features/RepairRequest/RepairRequest";

export interface IRepairRequestMapper
{
    RepairRequestToDto(repairRequest: RepairRequest): RepairRequestDto;
}

export class RepairRequestMapper implements IRepairRequestMapper
{
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
            items: repairRequest.requestedItems.map(item => ({
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
            })),
        };
    }
}