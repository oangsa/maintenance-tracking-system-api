import { Department } from "../../Infrastructures/Entities/Master/Department";
import { DepartmentParameter } from "../RequestFeatures/DepartmentParameter";
import { PagedResult } from "../RequestFeatures/Core/PageResult";

export interface IDepartmentRepository
{
    GetDepartmentById(id: number): Promise<Department | null>;
    GetDepartmentByCode(code: string, includeDeleted?: boolean): Promise<Department | null>;
    GetListDepartment(parameters: DepartmentParameter): Promise<PagedResult<Department>>;
    CreateDeparment(department: Department): Promise<Department>;
    UpdateDepartment(department: Partial<Department>): Promise<Department>;
    DeleteDepartment(id: number): Promise<void>;
}
