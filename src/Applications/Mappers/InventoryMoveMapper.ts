import { InventoryMoveDto } from "../DataTransferObjects/InventoryMove/InventoryMoveDto";
import { InventoryMove } from "@/Infrastructures/Entities/Features/InventoryMove/InventoryMove";
import { InventoryMoveItem } from "@/Infrastructures/Entities/Features/InventoryMove/InventoryMoveItem";

export interface IInventoryMoveMapper {
    InventoryMoveToDto(inventoryMove: InventoryMove): InventoryMoveDto;
}

export class InventoryMoveMapper implements IInventoryMoveMapper {
    
    InventoryMoveToDto(entity: InventoryMove): InventoryMoveDto {
        return {
            id: entity.id,
            moveNo: entity.moveNo,
            reason: entity.reason,
            moveDate: entity.moveDate,
            remark: entity.remark,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            createdBy: entity.createdBy,
            updatedBy: entity.updatedBy,
            inventoryMoveItems: entity.inventoryMoveItems?.map(item => this.mapItemToDto(item)) ?? []
        };
    }

    private mapItemToDto(item: InventoryMoveItem) {
        return {
            id: item.id,
            inventoryMoveId: item.inventoryMoveId,
            partId: item.partId,
            quantityIn: item.quantityIn,
            quantityOut: item.quantityOut,
            note: item.note,
        };
    }
}