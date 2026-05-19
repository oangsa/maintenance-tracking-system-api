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
        const data = WorkOrder as any;
        return {
            id: WorkOrder.id,
            repairRequestItemId: WorkOrder.repairRequestItemId,
            scheduledStart: WorkOrder.scheduledStart,
            scheduledEnd: WorkOrder.scheduledEnd,
            orderSequence: WorkOrder.orderSequence,
            isFinal: WorkOrder.isFinal,
            statusId: WorkOrder.statusId,
            createdAt: WorkOrder.createdAt,
            updatedAt: WorkOrder.updatedAt,
            createdBy: WorkOrder.createdBy,
            updatedBy: WorkOrder.updatedBy,
            repairRequestItemDescription: data.repairRequestItemDescription,
            statusName: data.statusName,
            statusCode: data.statusCode,
            productName: data.productName,
            requestNo: data.requestNo,
            
            status: data.status,
            repairRequestItem: data.repairRequestItem,
            repairRequest: data.repairRequest,
        
        };
    }
}