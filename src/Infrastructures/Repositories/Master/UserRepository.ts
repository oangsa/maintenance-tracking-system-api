import { sql, SQL } from "drizzle-orm";
import { IUserRepository } from "../../../Domains/Repositories/IUserRepository";
import { User } from "../../Entities/Master/User";
import { PagedResult } from "../../../Domains/RequestFeatures/Core/PageResult";
import { UserParameter } from "../../../Domains/RequestFeatures/UserParameter";
import { AppDrizzleDB } from "../../Database/Drizzle";
import { rolesEnum, users, department, userDepartment } from "../../Database/Drizzle/schema";
import { QueryBuilder } from "../Extensions/QueryBuilder";
import { createPagedResult } from "@/Shared/Utilities/RequestFeatures/CreatePageResult";
import { normalizeRequestParameters } from "@/Shared/Utilities/RequestFeatures/NormalizedRequestParameters";

type UserRow = {
    id: number;
    email: string;
    password_hash: string | null;
    name: string | null;
    avatar_url: string | null;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
    deleted: boolean | null;
    role: (typeof rolesEnum.enumValues)[number];
    token_version: number;
    department_id: number | null;
    department_name: string | null;
    department_code: string | null;
    department_created_at: string | null;
    department_updated_at: string | null;
    department_created_by: string | null;
    department_updated_by: string | null;
    department_deleted: boolean | null;
};

export class UserRepository implements IUserRepository
{
    private readonly _db: AppDrizzleDB;

    constructor(db: AppDrizzleDB)
    {
        this._db = db;
    }

    private mapRowToUser(row: UserRow): User
    {
        return {
            id: row.id,
            email: row.email,
            passwordHash: row.password_hash,
            name: row.name,
            avatarUrl: row.avatar_url,
            createdAt: row.created_at ?? '',
            updatedAt: row.updated_at ?? '',
            createdBy: row.created_by,
            updatedBy: row.updated_by,
            deleted: row.deleted ?? false,
            role: row.role,
            tokenVersion: row.token_version,
            departmentId: row.department_id,
            department: row.department_id ? {
              id: row.department_id,
              name: row.department_name ?? '',
              code: row.department_code ?? '',
              createdAt: row.department_created_at ?? '',
              updatedAt: row.department_updated_at ?? '',
              createdBy: row.department_created_by ?? null,
              updatedBy: row.department_updated_by ?? null,
              deleted: row.department_deleted ?? false,
            } : undefined,
        };
    }

    async GetUserById(id: number): Promise<User | null>
    {
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
            WHERE users.id = ${id}
              AND users.deleted = false
            LIMIT 1
        `);

        if (!result || result.length === 0) return null;

        return this.mapRowToUser(result[0] as UserRow);
    }

    async GetUserByEmail(email: string, includeDeleted: boolean = false): Promise<User | null>
    {

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

        return this.mapRowToUser(result[0] as UserRow);
    }

    async GetListUser(parameters: UserParameter): Promise<PagedResult<User>>
    {
        const params = normalizeRequestParameters(parameters);
        const offset = (params.pageNumber - 1) * params.pageSize;
        const limit = params.pageSize;

        const whereConditions: SQL[] = [sql`deleted = ${params.deleted ?? false}`];

        if (params.excludeId)
        {
            whereConditions.push(sql`users.id != ${params.excludeId}`);
        }

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

        const innerQuery = sql`
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
                d.id   AS department_id,
                d.name AS department_name,
                d.code AS department_code,
                d.created_at AS department_created_at,
                d.updated_at AS department_updated_at,
                d.created_by AS department_created_by,
                d.updated_by AS department_updated_by,
                d.deleted AS department_deleted
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
            ) d ON true
        `;

        const [userResults, countResult] = await Promise.all([
            this._db.db.execute<UserRow>(sql`
                SELECT * FROM (${innerQuery}) base
                ${whereClause}
                ${orderByClause}
                LIMIT ${limit}
                OFFSET ${offset}
            `),
            this._db.db.execute<{ count: number }>(sql`
                SELECT COUNT(*)::int AS count
                FROM (${innerQuery}) base
                ${whereClause}
            `),
        ]);

        const totalCount = countResult[0]?.count ?? 0;
        const items = Array.from(userResults).map((row: UserRow) => this.mapRowToUser(row));

        return createPagedResult(items, totalCount, params.pageNumber, params.pageSize);
    }

    async CreateUser(user: User): Promise<User>
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

            if (!insertResult || insertResult.length === 0 || !insertResult[0])
            {
                throw new Error("Failed to create user");
            }

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

        return this.mapRowToUser(row as UserRow);
    }

    async UpdateUser(user: Partial<User>): Promise<User>
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

        return this.mapRowToUser(row as UserRow);
    }

    async DeleteUser(id: number): Promise<void>
    {
        await this._db.db.execute(sql`
            UPDATE ${users}
            SET deleted = true, updated_at = ${new Date().toISOString()}
            WHERE id = ${id}
        `);
    }

    async UpdateTokenVersion(id: number): Promise<void>
    {
        await this._db.db.execute(sql`
            UPDATE ${users}
            SET token_version = token_version + 1
            WHERE id = ${id}
        `);
    }
}
