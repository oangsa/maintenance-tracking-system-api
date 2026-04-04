import { sql, SQL } from "drizzle-orm";
import { IRepairRequestRepository } from "@/Domains/Repositories/IRepairRequestRepository";
import { User } from "@/Infrastructures/Entities/Master/User";
import { PagedResult } from "@/Domains/RequestFeatures/Core/PageResult";
import { RepairRequestParameter } from "@/Domains/RequestFeatures/RepairRequestParameter";
import { AppDrizzleDB } from "@/Infrastructures/Database/Drizzle";
import { rolesEnum, repairPriority, users, department, repairRequest, repairRequestItem, repairStatus } from "@/Infrastructures/Database/Drizzle/schema";
import { QueryBuilder } from "@/Infrastructures/Repositories/Extensions/QueryBuilder";
import { createPagedResult } from "@/Shared/Utilities/RequestFeatures/CreatePageResult";
import { normalizeRequestParameters } from "@/Shared/Utilities/RequestFeatures/NormalizedRequestParameters";
import { RepairRequest } from "@/Infrastructures/Entities/Features/RepairRequest/RepairRequest";
import { RepairPriority } from "@/Shared/Enums/RepairPriority";
import { RepairRequestItem } from "@/Infrastructures/Entities/Features/RepairRequest/RepairRequestItem";

type RepairRequestRow = {
    id: number;
    request_no: string;
    requester_id: number;
    priority: (typeof repairPriority.enumValues)[number];
    requested_at: string;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
    deleted: boolean | null;

    current_status_id: number;
    current_status_name: string;
    current_status_code: string;
    current_status_order_sequence: number;
    current_status_is_final: boolean;

    requester_email: string;
    requester_name: string | null;
    requester_role: (typeof rolesEnum.enumValues)[number] | null;
};

export type RepairRequestItemRow = {
    id: number;
    repair_request_id: number;
    product_id: number;
    product_name: string;
    product_code: string;
    desciription: string;
    product_type_id: number;
    quantity: number;
    repair_status_id: number;
    repair_status_name: string;
    repair_status_code: string;
    repair_status_order_sequence: number;
    repair_status_is_final: boolean;
    department_id: number;
    department_name: string;
    department_code: string;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
    deleted: boolean | null;
}

export class RepairRequestRepository implements IRepairRequestRepository
{
    private readonly _db: AppDrizzleDB;

    constructor(db: AppDrizzleDB)
    {
        this._db = db;
    }

    private mapRowToRepairRequest(row: RepairRequestRow): RepairRequest
    {
        const request: RepairRequest = {
            id: row.id,
            requestNo: row.request_no,
            requesterId: row.requester_id,
            priority: row.priority as RepairPriority,
            requestAt: row.requested_at,
            currentStatusId: row.current_status_id,
            createdAt: row.created_at!,
            updatedAt: row.updated_at!,
            createdBy: row.created_by!,
            updatedBy: row.updated_by!,

            currentStatus: {
                id: row.current_status_id,
                name: row.current_status_name,
                code: row.current_status_code,
                orderSequence: row.current_status_order_sequence,
                isFinal: row.current_status_is_final,
            },

            requester: {
                id: row.requester_id,
                email: row.requester_email,
                name: row.requester_name!,
                role: row.requester_role!,
            },

            requestedItems: []
        }

        return request;
    }

    private mapRowToRepairRequestItem(row: RepairRequestItemRow): RepairRequestItem
    {
        return {
            id: row.id,
            repairRequestId: row.repair_request_id,
            productId: row.product_id,
            description: row.desciription,
            quantity: row.quantity,
            repairStatusId: row.repair_status_id,
            departmentId: row.department_id,
            createdAt: row.created_at!,
            updatedAt: row.updated_at!,
            createdBy: row.created_by!,
            updatedBy: row.updated_by!,

            product: {
                id: row.product_id,
                name: row.product_name,
                code: row.product_code,
                productTypeId: row.product_type_id,
            },

            repairStatus: {
                id: row.repair_status_id,
                name: row.repair_status_name,
                code: row.repair_status_code,
                orderSequence: row.repair_status_order_sequence,
                isFinal: row.repair_status_is_final,
            }
        }
    }

    private filledRequestedItem(repairRequest: RepairRequest, requestedItems: RepairRequestItemRow[]): void
    {
        for (const itemRow of requestedItems)
        {
            const item = this.mapRowToRepairRequestItem(itemRow);
            repairRequest.requestedItems.push(item);
        }
    }

    async GetRepairRequestById(id: number): Promise<RepairRequest | null>
    {
      const result = await this._db.db.execute<RepairRequestRow>(sql`
            SElECT
                r.id,
                r.request_no,
                r.requester_id,
                r.priority,
                r.requested_at,
                r.created_at,
                r.updated_at,
                r.created_by,
                r.updated_by,
                r.deleted,
                r.current_status_id,
                rs.code as current_status_code,
                rs.name as current_status_name,
                rs.order_sequence as current_status_order_sequence,
                rs.is_final as current_status_is_final,
                u.email as requester_email,
                u.name as requester_name,
                u.role as requester_role
            FROM ${repairRequest} r
            LEFT JOIN ${repairStatus} rs ON rs.id = r.current_status_id
            LEFT JOIN ${users} u ON u.id = r.requester_id
            WHERE r.id = 1 AND r.deleted = false
            LIMIT 1;
        `);

        if (!result || result.length === 0) return null;

        return this.mapRowToUser(result[0]);
    }

    async GetRepairRequestByRequestNo(requestNo: string, includeDeleted: boolean = false): Promise<User | null>
    {
        console.log(email, includeDeleted);
        const deletedFilter = includeDeleted ? sql`` : sql`AND users.deleted = false`;

        const result = await this._db.db.execute<UserRow>(sql`
          SELECT
              users.id,
              users.email,
              users.password_hash,
              users.name,
              users.avatar_url,
              users.created_at,
              users.updated_at,
              users.created_by,
              users.updated_by,
              users.deleted,
              users.role,
              users.token_version,
              d.id AS department_id,
              d.name AS department_name,
              d.code AS department_code,
              d.created_at AS department_created_at,
              d.updated_at AS department_updated_at,
              d.created_by AS department_created_by,
              d.updated_by AS department_updated_by,
              d.deleted AS department_deleted
          FROM ${users}
          LEFT JOIN ${userDepartment} ud ON users.id = ud.user_id
          LEFT JOIN ${department} d ON ud.department_id = d.id
          WHERE users.email = ${email} ${deletedFilter}
          LIMIT 1
        `);

        if (!result || result.length === 0) return null;

        return this.mapRowToUser(result[0]);
    }

    async GetListRepairRequest(parameters: UserParameter): Promise<PagedResult<User>>
    {
        const params = normalizeRequestParameters(parameters);
        const offset = (params.pageNumber - 1) * params.pageSize;
        const limit = params.pageSize;

        const whereConditions: SQL[] = [sql`users.deleted = ${params.deleted ?? false}`];

        if (params.search && params.search.length > 0)
        {
            const filterSQL = QueryBuilder.BuildRawSQLFilterExpression(params.search);
            if (filterSQL) whereConditions.push(filterSQL);
        }

        if (params.searchTerm)
        {
            const searchSQL = QueryBuilder.BuildRawSQLSearchExpression(params.searchTerm);
            if (searchSQL) whereConditions.push(searchSQL);
        }

        const whereClause = sql`WHERE ${sql.join(whereConditions, sql` AND `)}`;
        const orderByClause = QueryBuilder.BuildRawSQLOrderQuery(params.orderBy);

        const [userResults, countResult] = await Promise.all([
            this._db.db.execute<UserRow>(sql`
                SELECT
                    users.id,
                    users.email,
                    users.password_hash,
                    users.name,
                    users.avatar_url,
                    users.created_at,
                    users.updated_at,
                    users.created_by,
                    users.updated_by,
                    users.deleted,
                    users.role,
                    users.token_version,
                    department.id AS department_id,
                    department.name AS department_name,
                    department.code AS department_code,
                    department.created_at AS department_created_at,
                    department.updated_at AS department_updated_at,
                    department.created_by AS department_created_by,
                    department.updated_by AS department_updated_by,
                    department.deleted AS department_deleted
                FROM ${users}
                LEFT JOIN LATERAL (
                    SELECT
                        dept.id,
                        dept.name,
                        dept.code,
                        dept.created_at,
                        dept.updated_at,
                        dept.created_by,
                        dept.updated_by,
                        dept.deleted
                    FROM ${userDepartment} ud
                    JOIN ${department} dept ON ud.department_id = dept.id
                    WHERE ud.user_id = users.id
                    LIMIT 1
                ) department ON true
                ${whereClause}
                ${orderByClause}
                LIMIT ${limit}
                OFFSET ${offset}
            `),
            this._db.db.execute<{ count: number }>(sql`
                SELECT COUNT(*)::int AS count
                FROM ${users}
                LEFT JOIN LATERAL (
                    SELECT
                        dept.id,
                        dept.name,
                        dept.code
                    FROM ${userDepartment} ud
                    JOIN ${department} dept ON ud.department_id = dept.id
                    WHERE ud.user_id = users.id
                    LIMIT 1
                ) department ON true
                ${whereClause}
            `),
        ]);

        const totalCount = countResult[0]?.count ?? 0;
        const items = Array.from(userResults).map((row: UserRow) => this.mapRowToUser(row));

        return createPagedResult(items, totalCount, params.pageNumber, params.pageSize);
    }

    async CreateRepairRequest(repairRequest: RepairRequest): Promise<User>
    {
        const row = await this._db.db.transaction(async (tx) =>
        {
            const insertResult = await tx.execute<{ id: number }>(sql`
                INSERT INTO ${users} (
                    email,
                    password_hash,
                    name,
                    avatar_url,
                    created_by,
                    updated_by,
                    deleted,
                    role
                )
                VALUES (
                    ${user.email},
                    ${user.passwordHash},
                    ${user.name},
                    ${user.avatarUrl},
                    ${user.createdBy},
                    ${user.updatedBy},
                    ${user.deleted ?? false},
                    ${user.role}
                )
                RETURNING id
            `);

            const userId = insertResult[0].id;

            if (user.departmentId)
            {
                await tx.execute(sql`
                    INSERT INTO ${userDepartment} (user_id, department_id, created_by, updated_by)
                    VALUES (
                        ${userId},
                        ${user.departmentId},
                        ${user.createdBy ?? null},
                        ${user.updatedBy ?? null}
                    )
                `);
            }

            const result = await tx.execute<UserRow>(sql`
                SELECT
                    users.id,
                    users.email,
                    users.password_hash,
                    users.name,
                    users.avatar_url,
                    users.created_at,
                    users.updated_at,
                    users.created_by,
                    users.updated_by,
                    users.deleted,
                    users.role,
                    users.token_version,
                    d.id AS department_id,
                    d.name AS department_name,
                    d.code AS department_code,
                    d.created_at AS department_created_at,
                    d.updated_at AS department_updated_at,
                    d.created_by AS department_created_by,
                    d.updated_by AS department_updated_by,
                    d.deleted AS department_deleted
                FROM ${users}
                LEFT JOIN ${userDepartment} ud ON users.id = ud.user_id
                LEFT JOIN ${department} d ON ud.department_id = d.id
                WHERE users.id = ${userId}
                LIMIT 1
            `);

            return result[0];
        });

        return this.mapRowToUser(row);
    }

    async UpdateRepairRequest(repairRequest: Partial<RepairRequest>): Promise<User>
    {
        const row = await this._db.db.transaction(async (tx) =>
        {
            await tx.execute(sql`
                UPDATE ${users}
                SET
                    email = COALESCE(${user.email ?? null}, email),
                    password_hash = COALESCE(${user.passwordHash ?? null}, password_hash),
                    name = COALESCE(${user.name ?? null}, name),
                    avatar_url = COALESCE(${user.avatarUrl ?? null}, avatar_url),
                    updated_at = ${new Date().toISOString()},
                    updated_by = COALESCE(${user.updatedBy ?? null}, updated_by),
                    role = COALESCE(${user.role ?? null}::roles_enum, role),
                    deleted = COALESCE(${user.deleted ?? null}, deleted)
                WHERE id = ${user.id}
            `);

            if (user.departmentId !== undefined)
            {
                await tx.execute(sql`
                    DELETE FROM ${userDepartment}
                    WHERE user_id = ${user.id}
                `);

                if (user.departmentId !== null)
                {
                    await tx.execute(sql`
                        INSERT INTO ${userDepartment} (user_id, department_id, created_by, updated_by)
                        VALUES (
                            ${user.id},
                            ${user.departmentId},
                            ${user.updatedBy ?? null},
                            ${user.updatedBy ?? null}
                        )
                        ON CONFLICT (user_id, department_id) DO UPDATE
                            SET updated_by = EXCLUDED.updated_by,
                                updated_at = now()
                    `);
                }
            }

            const result = await tx.execute<UserRow>(sql`
                SELECT
                    users.id,
                    users.email,
                    users.password_hash,
                    users.name,
                    users.avatar_url,
                    users.created_at,
                    users.updated_at,
                    users.created_by,
                    users.updated_by,
                    users.deleted,
                    users.role,
                    users.token_version,
                    d.id AS department_id,
                    d.name AS department_name,
                    d.code AS department_code,
                    d.created_at AS department_created_at,
                    d.updated_at AS department_updated_at,
                    d.created_by AS department_created_by,
                    d.updated_by AS department_updated_by,
                    d.deleted AS department_deleted
                FROM ${users}
                LEFT JOIN ${userDepartment} ud ON users.id = ud.user_id
                LEFT JOIN ${department} d ON ud.department_id = d.id
                WHERE users.id = ${user.id}
                LIMIT 1
            `);

            return result[0];
        });

        return this.mapRowToUser(row);
    }

    async DeleteRepairRequest(id: number): Promise<void>
    {
        await this._db.db.execute(sql`
            UPDATE ${users}
            SET deleted = true, updated_at = ${new Date().toISOString()}
            WHERE id = ${id}
        `);
    }
}
