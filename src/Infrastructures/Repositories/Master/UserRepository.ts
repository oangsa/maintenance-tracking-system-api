import { sql, SQL } from "drizzle-orm";
import { IUserRepository } from "../../../Domains/Repositories/IUserRepository";
import { User } from "../../Entities/Master/User";
import { PagedResult } from "../../../Domains/RequestFeatures/Core/PageResult";
import { UserParameter } from "../../../Domains/RequestFeatures/UserParameter";
import { AppDrizzleDB } from "../../Database/Drizzle";
import { rolesEnum, users } from "../../Database/Drizzle/schema";
import { QueryBuilder } from "../Extensions/QueryBuilder";
import { createPagedResult } from "../../../Shared/Utilities/RequestFeatures/CreatePageResult";
import { normalizeRequestParameters } from "../../../Shared/Utilities/RequestFeatures/NormalizedRequestParameters";

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
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            createdBy: row.created_by,
            updatedBy: row.updated_by,
            deleted: row.deleted,
            role: row.role,
        };
    }

    async GetUserById(id: number): Promise<User | null>
    {
        const result = await this._db.db.execute<UserRow>(sql`
            SELECT
                id,
                email,
                password_hash,
                name,
                avatar_url,
                created_at,
                updated_at,
                created_by,
                updated_by,
                deleted,
                role
            FROM ${users}
            WHERE id = ${id}
              AND deleted = false
            LIMIT 1
        `);

        if (!result || result.length === 0) return null;

        return this.mapRowToUser(result[0]);
    }

    async GetUserByEmail(email: string, includeDeleted: boolean = false): Promise<User | null>
    {
        const deletedFilter = includeDeleted ? sql`` : sql`AND deleted = false`;

        const result = await this._db.db.execute<UserRow>(sql`
            SELECT
                id,
                email,
                password_hash,
                name,
                avatar_url,
                created_at,
                updated_at,
                created_by,
                updated_by,
                deleted,
                role
            FROM ${users}
            WHERE email = ${email}
            ${deletedFilter}
            LIMIT 1
        `);

        if (!result || result.length === 0) return null;

        return this.mapRowToUser(result[0]);
    }

    async GetListUser(parameters: UserParameter): Promise<PagedResult<User>>
    {
        const params = normalizeRequestParameters(parameters);
        const offset = (params.pageNumber - 1) * params.pageSize;
        const limit = params.pageSize;

        const whereConditions: SQL[] = [sql`deleted = ${params.deleted ?? false}`];

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
                    id,
                    email,
                    password_hash,
                    name,
                    avatar_url,
                    created_at,
                    updated_at,
                    created_by,
                    updated_by,
                    deleted,
                    role
                FROM ${users}
                ${whereClause}
                ${orderByClause}
                LIMIT ${limit}
                OFFSET ${offset}
            `),
            this._db.db.execute<{ count: number }>(sql`
                SELECT COUNT(*)::int AS count
                FROM ${users}
                ${whereClause}
            `),
        ]);

        const totalCount = countResult[0]?.count ?? 0;
        const items = Array.from(userResults).map((row: UserRow) => this.mapRowToUser(row));

        return createPagedResult(items, totalCount, params.pageNumber, params.pageSize);
    }

    async CreateUser(user: User): Promise<User>
    {
        // console.log(user)
        const result = await this._db.db.execute<UserRow>(sql`
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
            RETURNING
                id,
                email,
                password_hash,
                name,
                avatar_url,
                created_by,
                updated_by,
                deleted,
                role
        `);

        console.log(result)

        return this.mapRowToUser(result[0]);
    }

    async UpdateUser(user: Partial<User>): Promise<User>
    {
        const result = await this._db.db.execute<UserRow>(sql`
            UPDATE ${users}
            SET
                email         = COALESCE(${user.email ?? null}, email),
                password_hash = COALESCE(${user.passwordHash ?? null}, password_hash),
                name          = COALESCE(${user.name ?? null}, name),
                avatar_url    = COALESCE(${user.avatarUrl ?? null}, avatar_url),
                updated_at    = ${new Date().toISOString()},
                updated_by    = COALESCE(${user.updatedBy ?? null}, updated_by),
                role          = COALESCE(${user.role ?? null}::roles_enum, role),
                deleted       = COALESCE(${user.deleted ?? null}, deleted)
            WHERE id = ${user.id}
            RETURNING
                id,
                email,
                password_hash,
                name,
                avatar_url,
                created_at,
                updated_at,
                created_by,
                updated_by,
                deleted,
                role
        `);

        return this.mapRowToUser(result[0]);
    }

    async DeleteUser(id: number): Promise<void>
    {
        await this._db.db.execute(sql`
            UPDATE ${users}
            SET deleted = true, updated_at = ${new Date().toISOString()}
            WHERE id = ${id}
        `);
    }
}
