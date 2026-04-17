import { InventoryMoveDto } from "../../DataTransferObjects/InventoryMove/InventoryMoveDto";
import { InventoryMoveForCreateDto } from "../../DataTransferObjects/InventoryMove/InventoryMoveForCreateDto";
import { InventoryMoveForUpdateDto } from "../../DataTransferObjects/InventoryMove/InventoryMoveForUpdateDto";
import { InventoryMoveParameter } from "../../../Domains/RequestFeatures/InventoryMoveParameter";
import { PagedResult } from "../../../Domains/RequestFeatures/Core/PageResult";
import { IInventoryMoveService } from "../../Services/IInventoryMoveService";
import { IRepositoryManager } from "../../../Domains/Repositories/Core/IRepositoryManager";
import { IMapperManager } from "../../Mappers/Core/MapperManager";
import { IUserProvider } from "../../Providers/UserProvider";
import { ICoreAdapterManager } from "../CoreAdapterManager";
import { InventoryMove } from "../../../Infrastructures/Entities/Features/InventoryMove/InventoryMove";
import { RoleAuthorizationGuard } from "../../../Shared/Utilities/Authentication/RoleAuthorizationGuard";
import { Role } from "../../../Shared/Enums/Role";
import { InventoryMoveNotFoundException } from "../../../Domains/Exceptions/InventoryMove/InventoryMoveNotFoundException";
import { InventoryMoveDuplicateBadRequestException } from "../../../Domains/Exceptions/InventoryMove/InventoryMoveDuplicateBadRequestException";

export class InventoryMoveService implements IInventoryMoveService {
    private readonly _repositoryManager: IRepositoryManager;
    private readonly _mapperManager: IMapperManager;
    private readonly _userProvider: IUserProvider;

    constructor(coreAdapterManager: ICoreAdapterManager, mapperManager: IMapperManager, userProvider: IUserProvider) {
        this._repositoryManager = coreAdapterManager.repositoryManager;
        this._mapperManager = mapperManager;
        this._userProvider = userProvider;
    }

    private ExpectRole(role: Role): void {
        RoleAuthorizationGuard.assertExpectedRole(this._userProvider.getCurrentUser()?.role!, role);
    }

    private getCalledBy(): string {
        const current = this._userProvider.getCurrentUser();
        return current?.name ?? "System";
    }

    private async GetInventoryMoveAndCheckIfItExists(id: number): Promise<InventoryMove> {
        const inventoryMoveEntity = await this._repositoryManager.inventoryMoveRepository.GetInventoryMoveById(id);

        if (!inventoryMoveEntity) {
            throw new InventoryMoveNotFoundException(id);
        }

        return inventoryMoveEntity;
    }

    async GetListInventoryMove(parameters: InventoryMoveParameter): Promise<PagedResult<InventoryMoveDto>> {
        this.ExpectRole("admin");

        const pagedInventoryMoves = await this._repositoryManager.inventoryMoveRepository.GetListInventoryMove(parameters);

        return {
            items: pagedInventoryMoves.items.map((move) => this._mapperManager.inventoryMoveMapper.InventoryMoveToDto(move)),
            meta: pagedInventoryMoves.meta,
        };
    }

    async GetInventoryMove(id: number): Promise<InventoryMoveDto> {
        const inventoryMoveEntity = await this.GetInventoryMoveAndCheckIfItExists(id);
        return this._mapperManager.inventoryMoveMapper.InventoryMoveToDto(inventoryMoveEntity);
    }

    async CreateInventoryMove(inventoryMoveForCreateDto: InventoryMoveForCreateDto): Promise<InventoryMoveDto> {
        this.ExpectRole("admin");

        const moveNo = inventoryMoveForCreateDto.moveNo ?? `MV-${new Date().getTime()}`;
        
        const existingMove = await this._repositoryManager.inventoryMoveRepository.GetInventoryMoveByMoveNo(moveNo, true);

        if (existingMove && !existingMove.deleted) {
            throw new InventoryMoveDuplicateBadRequestException(moveNo);
        }

        const dateNow = new Date().toISOString();
        const userName = this.getCalledBy();

        const newInventoryMove: InventoryMove = {
            id: 0,
            moveNo: moveNo,
            reason: inventoryMoveForCreateDto.reason as any,
            moveDate: inventoryMoveForCreateDto.moveDate ?? dateNow,
            remark: inventoryMoveForCreateDto.remark ?? "",
            createdAt: dateNow,
            updatedAt: dateNow,
            createdBy: userName,
            updatedBy: userName,
            deleted: false,
            inventoryMoveItems: inventoryMoveForCreateDto.inventoryMoveItems.map(item => ({
                id: 0,
                inventoryMoveId: 0,
                partId: item.partId,
                quantityIn: item.quantityIn,
                quantityOut: item.quantityOut,
                note: item.note ?? "",
                createdAt: dateNow,
                updatedAt: dateNow,
                createdBy: userName,
                updatedBy: userName,
                deleted: false
            })) as any
        };

        try {
            if (existingMove && existingMove.deleted) {
                const restoredMove = await this._repositoryManager.inventoryMoveRepository.UpdateInventoryMove({
                    ...existingMove,
                    ...newInventoryMove,
                    id: existingMove.id,
                    deleted: false,
                });

                return this._mapperManager.inventoryMoveMapper.InventoryMoveToDto(restoredMove);
            }

            const createdMove = await this._repositoryManager.inventoryMoveRepository.CreateInventoryMove(newInventoryMove);
            
            return this._mapperManager.inventoryMoveMapper.InventoryMoveToDto(createdMove);
        } catch (error: any) {
            if (error.code === "23505") {
                throw new InventoryMoveDuplicateBadRequestException(moveNo);
            }
            throw error;
        }
    }

    async UpdateInventoryMove(id: number, inventoryMoveForUpdateDto: InventoryMoveForUpdateDto): Promise<InventoryMoveDto> {
        this.ExpectRole("admin");

        const entity = await this.GetInventoryMoveAndCheckIfItExists(id);

        const updatedInventoryMove: InventoryMove = {
            ...entity,
            reason: (inventoryMoveForUpdateDto.reason as any) ?? entity.reason,
            moveDate: inventoryMoveForUpdateDto.moveDate ?? entity.moveDate,
            remark: inventoryMoveForUpdateDto.remark ?? entity.remark,
            updatedAt: new Date().toISOString(),
            updatedBy: this.getCalledBy(),
        };

        const result = await this._repositoryManager.inventoryMoveRepository.UpdateInventoryMove(updatedInventoryMove);
        return this._mapperManager.inventoryMoveMapper.InventoryMoveToDto(result);
    }

    async DeleteInventoryMove(id: number): Promise<void> {
        this.ExpectRole("admin");
        
        await this.GetInventoryMoveAndCheckIfItExists(id);

        await this._repositoryManager.inventoryMoveRepository.DeleteInventoryMove(id);
    }

    async DeleteInventoryMoveCollection(ids: number[]): Promise<void> {
        for (const id of ids) {
            await this.DeleteInventoryMove(id);
        }
    }
}