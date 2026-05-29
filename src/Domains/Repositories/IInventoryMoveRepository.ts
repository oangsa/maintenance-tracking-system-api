import { InventoryMove } from "../../Infrastructures/Entities/Features/InventoryMove/InventoryMove";
import { InventoryMoveParameter } from "../../Domains/RequestFeatures/InventoryMoveParameter"; 
import { PagedResult } from "../RequestFeatures/Core/PageResult";

export interface IInventoryMoveRepository 
{
  GetInventoryMoveById(id: number): Promise<InventoryMove | null>;
  GetInventoryMoveByMoveNo(moveNo: string, includeDeleted?: boolean): Promise<InventoryMove | null>;
  GetListInventoryMove(parameters: InventoryMoveParameter): Promise<PagedResult<InventoryMove>>;
  CreateInventoryMove(inventoryMove: InventoryMove ): Promise<InventoryMove>;
  UpdateInventoryMove(inventoryMove: Partial<InventoryMove>): Promise<InventoryMove>;
  DeleteInventoryMove(id: number): Promise<void>;
  CheckIfWorkOrderPartExistsInMove(workOrderPartId: number): Promise<boolean>;
}