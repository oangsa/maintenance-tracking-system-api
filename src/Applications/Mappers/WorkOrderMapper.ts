import { WorkOrderDto } from "../DataTransferObjects/WorkOrder/WorkOrderDto";
import { WorkOrder } from "@/Infrastructures/Entities/Master/WorkOrder";

export interface IWorkOrderMapper
{
    WorkOrderToDto(WorkOrder: WorkOrder): WorkOrderDto;
}

export class WorkOrderMapper implements IWorkOrderMapper
{
    WorkOrderToDto(WorkOrder: WorkOrder): WorkOrderDto
    {
        return {
            id: WorkOrder.id,
            repairRequestItemId: WorkOrder.repairRequestItemId,
            scheduledStart: WorkOrder.scheduledStart,
            scheduledEnd: WorkOrder.scheduledEnd,
            orderSequence: WorkOrder.orderSequence,
            statusId: WorkOrder.statusId,
            createdAt: WorkOrder.createdAt,
            updatedAt: WorkOrder.updatedAt,
            createdBy: WorkOrder.createdBy,
            updatedBy: WorkOrder.updatedBy,
            repairRequestItemDescription: WorkOrder.repairRequestItem?.description,
            repairRequestItemRepairStatusId: WorkOrder.repairRequestItem?.repairStatusId ?? null,
            repairRequestItemRepairStatusCode: WorkOrder.repairRequestItem?.repairStatus?.code ?? null,
            repairRequestItemRepairStatusName: WorkOrder.repairRequestItem?.repairStatus?.name ?? null,
            repairRequestItemProductName: WorkOrder.repairRequestItem?.product?.name,
            repairRequestRequestNo: WorkOrder.repairRequestRequestNo ?? undefined,

        };
    }
}
