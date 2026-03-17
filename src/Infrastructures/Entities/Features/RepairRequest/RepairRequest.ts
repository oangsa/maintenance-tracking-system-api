import { RepairStatus } from "../../Master/RepairStatus";
import { User } from "../../Master/User";
import { RepairPriority } from ".././../../../Shared/Enums/RepairPriority";
import { RepairRequestItem } from "./RepairRequestItem";


export interface RepairRequest
{
  id: number
  requestNo: string
  requesterId: number,
  priority: RepairPriority,
  requestAt: string,
  currentStatusId: number,
  createdAt: string,
  updatedAt: string,
  createdBy: string,
  updatedBy: string

  currentStatus: Pick<RepairStatus, 'id' | 'code' | 'name' | 'orderSequence' | 'isFinal'>,
  requester: Pick<User, 'id' | 'email' | 'name' | 'role'>
  requestedItems: RepairRequestItem[]
}
