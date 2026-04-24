import { InventoryMoveDto } from "../DataTransferObjects/InventoryMove/InventoryMoveDto";
import { InventoryMoveForCreateDto } from "../DataTransferObjects/InventoryMove/InventoryMoveForCreateDto";
import { InventoryMoveForUpdateDto } from "../DataTransferObjects/InventoryMove/InventoryMoveForUpdateDto";
import { InventoryMoveParameter } from "../../Domains/RequestFeatures/InventoryMoveParameter";
import { PagedResult } from "../../Domains/RequestFeatures/Core/PageResult";

export interface IInventoryMoveService {
    GetListInventoryMove(parameters: InventoryMoveParameter): Promise<PagedResult<InventoryMoveDto>>;
    GetInventoryMove(id: number): Promise<InventoryMoveDto>;
    CreateInventoryMove(inventoryMoveForCreateDto: InventoryMoveForCreateDto): Promise<InventoryMoveDto>;
    UpdateInventoryMove(id: number, inventoryMoveForUpdateDto: InventoryMoveForUpdateDto): Promise<InventoryMoveDto>;
    DeleteInventoryMove(id: number): Promise<void>;
    DeleteInventoryMoveCollection(ids: number[]): Promise<void>;
    ReverseInventoryMove(id: number, dto: InventoryMoveForCreateDto): Promise<InventoryMoveDto>;
}