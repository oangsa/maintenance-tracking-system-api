import { WorkTaskDto } from "../DataTransferObjects/WorkTask/WorkTaskDto";
import { WorkTask } from "@/Infrastructures/Entities/Master/WorkTask";
import { WorkTaskAssignDto } from "../DataTransferObjects/WorkTask/WorkTaskAssignDto";
import { WorkTaskAssignment } from "@/Infrastructures/Entities/Master/WorkTaskAssignment";

export interface IWorkTaskMapper
{
    WorkTaskToDto(workTask: WorkTask): WorkTaskDto;
    WorkTaskAssignmentToDto(workTaskAssignment: WorkTaskAssignment): WorkTaskAssignDto;
}

export class WorkTaskMapper implements IWorkTaskMapper
{
    WorkTaskToDto(workTask: WorkTask): WorkTaskDto
    {
        return {
            id: workTask.id,
            workOrderId: workTask.workOrderId,
            description: workTask.description,
            note: workTask.note,
            startedAt: workTask.startedAt,
            endedAt: workTask.endedAt,
            assigneeId: workTask.assigneeId,
            assigneeName: workTask.assigneeName,
            assigneeEmail: workTask.assigneeEmail,
            assignedById: workTask.assignedById,
            assignedByName: workTask.assignedByName,
            createdAt: workTask.createdAt,
            updatedAt: workTask.updatedAt,
            createdBy: workTask.createdBy,
            updatedBy: workTask.updatedBy,
        };
    }

    WorkTaskAssignmentToDto(workTaskAssignment: WorkTaskAssignment): WorkTaskAssignDto
    {
        return {
            id: workTaskAssignment.id,
            workTaskId: workTaskAssignment.workTaskId,
            assigneeId: workTaskAssignment.assigneeId,
            assigneeName: workTaskAssignment.assigneeName,
            assigneeEmail: workTaskAssignment.assigneeEmail,
            assignedById: workTaskAssignment.assignedById,
            assignedByName: workTaskAssignment.assignedByName,
            assignedAt: workTaskAssignment.assignedAt,
            unassignedAt: workTaskAssignment.unassignedAt,
            
        };
    }

}
