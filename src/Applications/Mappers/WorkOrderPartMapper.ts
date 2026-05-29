import { WorkOrderPartDto } from "../DataTransferObjects/WorkOrderPart/WorkOrderPartDto";
import { WorkOrderPart } from "@/Infrastructures/Entities/Master/WorkOrderPart";

export interface IWorkOrderPartMapper
{
    WorkOrderPartToDto(workOrderPart: WorkOrderPart): WorkOrderPartDto;
}

export class WorkOrderPartMapper implements IWorkOrderPartMapper
{
    WorkOrderPartToDto(workOrderPart: WorkOrderPart): WorkOrderPartDto
    {
        return {
            id: workOrderPart.id,
            workOrderId: workOrderPart.workOrderId,
            partId: workOrderPart.partId,
            partCode: workOrderPart.part?.code ?? null,
            partName: workOrderPart.part?.name ?? null,
            quantity: workOrderPart.quantity,
            note: workOrderPart.note,
            inventoryMoveItemId: workOrderPart.inventoryMoveItemId,
            createdAt: workOrderPart.createdAt,
            updatedAt: workOrderPart.updatedAt,
            createdBy: workOrderPart.createdBy,
            updatedBy: workOrderPart.updatedBy,
        };
    }
}
