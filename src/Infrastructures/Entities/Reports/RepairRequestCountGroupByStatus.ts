import { RepairStatus } from "../Master/RepairStatus";

export interface RepairRequestCountGroupByStatus
{
    statusName: RepairStatus["name"]
    value: number
}
