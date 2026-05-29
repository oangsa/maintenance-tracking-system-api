import { RequestParameters } from "./Core/RequestParameters";
import type { Role } from "../../Shared/Enums/Role";

export interface UserParameter extends RequestParameters
{
    orderBy?: "id" | "email";
    excludeId?: number;
    departmentId?: number;
    workOrderId?: number;
    roles?: Role[];
    excludeRoles?: Role[];
    includeUserIds?: number[];
}
