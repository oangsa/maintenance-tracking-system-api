import { DepartmentDto } from "../DataTransferObjects/Department/DepartmentDto";
import { Department } from "../../Infrastructures/Entities/Master/Department";

export interface IDepartmentMapper
{
    DepartmentToDto(department: Department): DepartmentDto;
}

export class DepartmentMapper implements IDepartmentMapper
{
    DepartmentToDto(department: Department): DepartmentDto
    {
        return {
            id: department.id,
            code: department.code,
            name: department.name,
            createdAt: department.createdAt,
            updatedAt: department.updatedAt,
            createdBy: department.createdBy,
            updatedBy: department.updatedBy,
        };
    }
}
