import { ForbiddenException } from "../../../Domains/Exceptions/ForbiddenException";
import { RoleRank } from "../../Constants/RoleRank";
import type { Role } from "../../Enums/Role";

export class RoleAuthorizationGuard
{
    private static getRank(role: string): number
    {
        return RoleRank[role.toLowerCase()] ?? 0;
    }

    private static canManageRole(actorRole: string, targetRole: string): boolean
    {
        return this.getRank(actorRole) > this.getRank(targetRole);
    }

    static assertCanCreate(actorRole: string, targetRole: string, actorDepartmentId?: number | null, targetDepartmentId?: number | null,): void
    {
        if (!this.canManageRole(actorRole, targetRole))
        {
            throw new ForbiddenException(`A '${actorRole}' is not allowed to create a user with role '${targetRole}'.`);
        }

        RoleAuthorizationGuard.assertSameDepartment(actorRole, actorDepartmentId, targetDepartmentId);
    }

    static assertExpectedRole(actorRole: string, expectedRole: Role): void
    {
        if (actorRole.toLowerCase() !== expectedRole.toLowerCase())
        {
            throw new ForbiddenException(`A '${actorRole}' is not allowed to perform this action. Expected role: '${expectedRole}'.`);
        }
    }

    static assertCanRead(_actorRole: string): void
    {
        // All authenticated users may list and view user profiles.
    }

    static assertCanUpdate(actorRole: string, currentTargetRole: string, incomingRole?: string | null, actorDepartmentId?: number | null, targetDepartmentId?: number | null ): void
    {
        if (!this.canManageRole(actorRole, currentTargetRole))
        {
            throw new ForbiddenException(`A '${actorRole}' is not allowed to update a '${currentTargetRole}' user.`);
        }

        if (incomingRole && !this.canManageRole(actorRole, incomingRole))
        {
            throw new ForbiddenException(`A '${actorRole}' is not allowed to assign the role '${incomingRole}' to another user.`);
        }

        RoleAuthorizationGuard.assertSameDepartment(actorRole, actorDepartmentId, targetDepartmentId);
    }

    static assertCanDelete( actorRole: string, targetRole: string, actorDepartmentId?: number | null, targetDepartmentId?: number | null): void
    {
        if (!this.canManageRole(actorRole, targetRole))
        {
            throw new ForbiddenException(`A '${actorRole}' is not allowed to delete a '${targetRole}' user.`);
        }

        RoleAuthorizationGuard.assertSameDepartment(actorRole, actorDepartmentId, targetDepartmentId);
    }

    private static assertSameDepartment(actorRole: string, actorDepartmentId?: number | null, targetDepartmentId?: number | null): void
    {
        if (actorRole.toLowerCase() === "admin") return;

        if (actorDepartmentId == null || targetDepartmentId == null) return;

        if (actorDepartmentId !== targetDepartmentId)
        {
            throw new ForbiddenException( "You are not allowed to manage users from a different department.");
        }
    }
}
