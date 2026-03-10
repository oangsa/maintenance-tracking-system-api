import { DepartmentDto } from "../../DataTransferObjects/Department/DepartmentDto";
import { DepartmentForCreateDto } from "../../DataTransferObjects/Department/DepartmentForCreateDto";
import { DepartmentForUpdateDto } from "../../DataTransferObjects/Department/DepartmentForUpdateDto";
import { DepartmentParameter } from "../../../Domains/RequestFeatures/DepartmentParameter";
import { PagedResult } from "../../../Domains/RequestFeatures/Core/PageResult";
import { IDepartmentService } from "../../Services/IDepartmentService";
import { IRepositoryManager } from "../../../Domains/Repositories/Core/IRepositoryManager";
import { IMapperManager } from "../../Mappers/Core/MapperManager";
import { IUserProvider } from "../../Providers/UserProvider";
import { ICoreAdapterManager } from "../CoreAdapterManager";
import { DepartmentNotFoundException } from "../../../Domains/Exceptions/Department/DepartmentNotFoundException";
import { Department } from "../../../Infrastructures/Entities/Master/Department";
import { DepartmentDuplicateBadRequestException } from "../../../Domains/Exceptions/Department/DepartmentDuplicateBadReqeustException";
import { RoleAuthorizationGuard } from "../../../Shared/Utilities/Authentication/RoleAuthorizationGuard";
import { Role } from "../../../Shared/Enums/Role";

export class DepartmentService implements IDepartmentService
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

    private async GetDepartmentAndCheckIfItExists(id: number): Promise<Department>
    {
        const departmentEntity = await this._repositoryManager.departmentRepository.GetDepartmentById(id);

        if (!departmentEntity)
        {
            throw new DepartmentNotFoundException(id);
        }

        return departmentEntity;
    }

    async GetListDepartment(parameters: DepartmentParameter): Promise<PagedResult<DepartmentDto>>
    {
        this.ExpectRole('admin');

        const pagedDepartments = await this._repositoryManager.departmentRepository.GetListDepartment(parameters);

        return {
            items: pagedDepartments.items.map(department => this._mapperManager.departmentMapper.DepartmentToDto(department)),
            meta: pagedDepartments.meta,
        };
    }

    async GetDepartment(id: number): Promise<DepartmentDto>
    {
        const departmentEntity = await this.GetDepartmentAndCheckIfItExists(id);

        return this._mapperManager.departmentMapper.DepartmentToDto(departmentEntity);
    }

    async CreateDepartment(departmentForCreateDto: DepartmentForCreateDto): Promise<DepartmentDto>
    {
        this.ExpectRole('admin');

        const existingDepartment = await this._repositoryManager.departmentRepository.GetDepartmentByCode(departmentForCreateDto.code, true);

        if (existingDepartment && !existingDepartment.deleted)
        {
            throw new DepartmentDuplicateBadRequestException(departmentForCreateDto.code);
        }

        const dateNow = new Date().toISOString();

        const newDepartment: Department = {
            id: 0,
            code: departmentForCreateDto.code,
            name: departmentForCreateDto.name,
            createdAt: dateNow,
            updatedAt: dateNow,
            createdBy: this.getCalledBy(),
            updatedBy: this.getCalledBy(),
            deleted: false,
        };

        try
        {
            if (existingDepartment && existingDepartment.deleted)
            {
                const restoredDepartment = await this._repositoryManager.departmentRepository.UpdateDepartment({
                    ...existingDepartment,
                    ...newDepartment,
                    id: existingDepartment.id,
                    deleted: false,
                });

                return this._mapperManager.departmentMapper.DepartmentToDto(restoredDepartment);
            }

            const createdDepartment = await this._repositoryManager.departmentRepository.CreateDeparment(newDepartment);
            return this._mapperManager.departmentMapper.DepartmentToDto(createdDepartment);
        }
        catch (error: any)
        {
            if (error.code === "23505")
            {
                throw new DepartmentDuplicateBadRequestException(departmentForCreateDto.code);
            }

            throw error;
        }

    }

    async UpdateDepartment(id: number, departmentForUpdateDto: DepartmentForUpdateDto): Promise<DepartmentDto>
    {
        this.ExpectRole('admin');

        const departmentEntity = await this.GetDepartmentAndCheckIfItExists(id);

        if (departmentForUpdateDto.code)
        {
            const existingDepartmentWithCode = await this._repositoryManager.departmentRepository.GetDepartmentByCode(departmentForUpdateDto.code, false);

            if (existingDepartmentWithCode && existingDepartmentWithCode.id !== id && !existingDepartmentWithCode.deleted)
            {
                throw new DepartmentDuplicateBadRequestException(departmentForUpdateDto.code);
            }
        }

        const updatedDepartment: Department = {
            ...departmentEntity,
            code: departmentForUpdateDto.code ?? departmentEntity.code,
            name: departmentForUpdateDto.name ?? departmentEntity.name,
            updatedAt: new Date().toISOString(),
            updatedBy: this.getCalledBy(),
        };

        try
        {
            const result = await this._repositoryManager.departmentRepository.UpdateDepartment(updatedDepartment);
            return this._mapperManager.departmentMapper.DepartmentToDto(result);
        }
        catch (error: any)
        {
            if (error.code === "23505")
            {
                throw new DepartmentDuplicateBadRequestException(departmentForUpdateDto.code!);
            }

            throw error;
        }
    }

    async DeleteDepartment(id: number): Promise<void>
    {
        this.ExpectRole('admin');

        await this.GetDepartmentAndCheckIfItExists(id);
        await this._repositoryManager.departmentRepository.DeleteDepartment(id);
    }

    async DeleteDepartmentCollection(ids: number[]): Promise<void>
    {
        for (const id of ids)
        {
            await this.DeleteDepartment(id);
        }
    }
}
