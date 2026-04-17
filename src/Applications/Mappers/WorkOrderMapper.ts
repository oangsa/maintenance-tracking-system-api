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
            repairRequestId: WorkOrder.repairRequestId,
            scheduledStart: WorkOrder.scheduledStart,
            scheduledEnd: WorkOrder.scheduledEnd,
            orderSequence: WorkOrder.orderSequence,
            isFinal: WorkOrder.isFinal,
            statusId: WorkOrder.statusId,
            createdAt: WorkOrder.createdAt,
            updatedAt: WorkOrder.updatedAt,
            createdBy: WorkOrder.createdBy,
            updatedBy: WorkOrder.updatedBy,
        
        };
    }
}