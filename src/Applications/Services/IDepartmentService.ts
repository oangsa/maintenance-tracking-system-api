import { DepartmentDto } from "../DataTransferObjects/Department/DepartmentDto";
import { DepartmentForCreateDto } from "../DataTransferObjects/Department/DepartmentForCreateDto";
import { DepartmentForUpdateDto } from "../DataTransferObjects/Department/DepartmentForUpdateDto";
import { DepartmentParameter } from "../../Domains/RequestFeatures/DepartmentParameter";
import { PagedResult } from "../../Domains/RequestFeatures/Core/PageResult";

export interface IDepartmentService
{
    GetListDepartment(parameters: DepartmentParameter): Promise<PagedResult<DepartmentDto>>;
    GetDepartment(id: number): Promise<DepartmentDto>;
    CreateDepartment(departmentForCreateDto: DepartmentForCreateDto): Promise<DepartmentDto>;
    UpdateDepartment(id: number, DepartmentForUpdateDto: DepartmentForUpdateDto): Promise<DepartmentDto>;
    DeleteDepartment(id: number): Promise<void>;
    DeleteDepartmentCollection(ids: number[]): Promise<void>;
}
