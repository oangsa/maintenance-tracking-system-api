import { Department } from "./Department";

export interface ProductType
{
    id: number;
    code: string;
    name: string;
    departmentId: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    deleted: boolean;

    department?: Department;
}
