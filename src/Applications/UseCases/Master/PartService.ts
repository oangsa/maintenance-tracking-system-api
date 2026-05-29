import { PartDto } from "../../DataTransferObjects/Part/PartDto";
import { PartForCreateDto } from "../../DataTransferObjects/Part/PartForCreateDto";
import { PartForUpdateDto } from "../../DataTransferObjects/Part/PartForUpdateDto";
import { PartParameter } from "../../../Domains/RequestFeatures/PartParameter";
import { PagedResult } from "../../../Domains/RequestFeatures/Core/PageResult";
import { IPartService } from "@/Applications/Services/IPartService";
import { IRepositoryManager } from "../../../Domains/Repositories/Core/IRepositoryManager";
import { IMapperManager } from "../../Mappers/Core/MapperManager";
import { IUserProvider } from "../../Providers/UserProvider";
import { ICoreAdapterManager } from "../CoreAdapterManager";
import { PartNotFoundException } from "../../../Domains/Exceptions/Part/PartNotFoundException";
import { Part } from "../../../Infrastructures/Entities/Master/Part";
import { PartDuplicateBadRequestException } from "../../../Domains/Exceptions/Part/PartDuplicateBadRequestException";
import { RoleAuthorizationGuard } from "../../../Shared/Utilities/Authentication/RoleAuthorizationGuard";
import { Role } from "../../../Shared/Enums/Role";


export class PartService implements IPartService
{
    private readonly _repositoryManager: IRepositoryManager;
    private readonly _mapperManager: IMapperManager;
    private readonly _userProvider: IUserProvider;

    constructor(coreAdapterManager: ICoreAdapterManager, mapperManager: IMapperManager, userProvider: IUserProvider)
    {
        this._repositoryManager = coreAdapterManager.repositoryManager;
        this._mapperManager = mapperManager;
        this._userProvider = userProvider;
    }

    private ExpectRole(role: Role): void
    {
        RoleAuthorizationGuard.assertExpectedRole(this._userProvider.getCurrentUser()?.role!, role);
    }

    private getCalledBy(): string
    {
        const current = this._userProvider.getCurrentUser();
        return current?.name ?? "System";
    }

    private async GetPartAndCheckIfItExists(id: number): Promise<Part>
    {
        const partEntity = await this._repositoryManager.partRepository.GetPartById(id);

        if (!partEntity)
        {
            throw new PartNotFoundException(id);
        }

        return partEntity;
    }

    async GetListPart(parameters: PartParameter): Promise<PagedResult<PartDto>>
    {
        this.ExpectRole('admin');

        const pagedParts = await this._repositoryManager.partRepository.GetListPart(parameters);

        return {
            items: pagedParts.items.map(part => this._mapperManager.partMapper.PartToDto(part)),
            meta: pagedParts.meta,
        };
    }

    async GetPart(id: number): Promise<PartDto>
    {
        const partEntity = await this.GetPartAndCheckIfItExists(id);

        return this._mapperManager.partMapper.PartToDto(partEntity);
    }

    async CreatePart(partForCreateDto: PartForCreateDto): Promise<PartDto>
    {
        this.ExpectRole('admin');

        const existingPart = await this._repositoryManager.partRepository.GetPartByCode(partForCreateDto.code, true);

        if (existingPart && !existingPart.deleted)
        {
            throw new PartDuplicateBadRequestException(partForCreateDto.code);
        }

        const dateNow = new Date().toISOString();

        const newPart: Part = {
            id: 0,
            code: partForCreateDto.code,
            name: partForCreateDto.name,
            productTypeId: partForCreateDto.productTypeId,
            productTypeCode: "",
            productTypeName: "",
            createdAt: dateNow,
            updatedAt: dateNow,
            createdBy: this.getCalledBy(),
            updatedBy: this.getCalledBy(),
            deleted: false,
        };

        try
        {
            if (existingPart && existingPart.deleted)
            {
                const restoredPart = await this._repositoryManager.partRepository.UpdatePart({
                    ...existingPart,
                    ...newPart,
                    id: existingPart.id,
                    deleted: false,
                });

                const hydratedPart = await this._repositoryManager.partRepository.GetPartById(restoredPart.id);
                return this._mapperManager.partMapper.PartToDto(hydratedPart!);
            }

            const createdPart = await this._repositoryManager.partRepository.CreatePart(newPart);
            const hydratedPart = await this._repositoryManager.partRepository.GetPartById(createdPart.id);
            return this._mapperManager.partMapper.PartToDto(hydratedPart!);
        }
        catch (error: any)
        {
            if (error.code === "23505")
            {
                throw new PartDuplicateBadRequestException(partForCreateDto.code);
            }

            throw error;
        }

    }

    async UpdatePart(id: number, partForUpdateDto: PartForUpdateDto): Promise<PartDto>
    {
        this.ExpectRole('admin');

        const partEntity = await this.GetPartAndCheckIfItExists(id);

        if (partForUpdateDto.code)
        {
            const existingPartWithCode = await this._repositoryManager.partRepository.GetPartByCode(partForUpdateDto.code, false);

            if (existingPartWithCode && existingPartWithCode.id !== id && !existingPartWithCode.deleted)
            {
                throw new PartDuplicateBadRequestException(partForUpdateDto.code);
            }
        }

        const updatedPart: Part = {
            ...partEntity,
            code: partForUpdateDto.code ?? partEntity.code,
            name: partForUpdateDto.name ?? partEntity.name,
            productTypeId: partForUpdateDto.productTypeId ?? partEntity.productTypeId,
            updatedAt: new Date().toISOString(),
            updatedBy: this.getCalledBy(),
        };

        try
        {
            const result = await this._repositoryManager.partRepository.UpdatePart(updatedPart);
            const hydratedPart = await this._repositoryManager.partRepository.GetPartById(result.id);
            return this._mapperManager.partMapper.PartToDto(hydratedPart!);
        }
        catch (error: any)
        {
            if (error.code === "23505")
            {
                throw new PartDuplicateBadRequestException(partForUpdateDto.code!);
            }

            throw error;
        }
    }

    async DeletePart(id: number): Promise<void>
    {
        this.ExpectRole('admin');

        await this.GetPartAndCheckIfItExists(id);
        await this._repositoryManager.partRepository.DeletePart(id);
    }

    async DeletePartCollection(ids: number[]): Promise<void>
    {
        for (const id of ids)
        {
            await this.DeletePart(id);
        }
    }
}
