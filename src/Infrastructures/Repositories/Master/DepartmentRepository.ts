import { IDepartmentRepository } from "../../../Domains/Repositories/IDepartmentRepository";
import { AppDrizzleDB } from "../../Database";
import { Department } from "../../Entities/Master/Department";
import { department as departmentTable } from "../../Database/Drizzle/schema";
import { sql, SQL } from "drizzle-orm";
import { PagedResult } from "../../../Domains/RequestFeatures/Core/PageResult";
import { DepartmentParameter } from "../../../Domains/RequestFeatures/DepartmentParameter";
import { createPagedResult } from "../../../Shared/Utilities/RequestFeatures/CreatePageResult";
import { normalizeRequestParameters } from "../../../Shared/Utilities/RequestFeatures/NormalizedRequestParameters";
import { QueryBuilder } from "../Extensions/QueryBuilder";

type DepartmentRow = {
    id: number;
    code: string;
    name: string;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
    deleted: boolean | null;
};

export class DepartmentRepository implements IDepartmentRepository
{
    private readonly _db: AppDrizzleDB;

    constructor(db: AppDrizzleDB)
    {
        this._db = db;
    }

    private mapRowToDepartment(row: DepartmentRow): Department
    {
        return {
            id: row.id,
            code: row.code,
            name: row.name,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            createdBy: row.created_by,
            updatedBy: row.updated_by,
            deleted: row.deleted,
        };
    }

    async GetDepartmentById(id: number): Promise<Department | null>
    {
        const result = await this._db.db.execute<DepartmentRow>(sql`
            SELECT
                id,
                code,
                name,
                created_at,
                updated_at,
                created_by,
                updated_by,
                deleted
            FROM ${departmentTable}
            WHERE id = ${id}
        `);

        if (result.length === 0)
        {
            return null;
        }

        return this.mapRowToDepartment(result[0]);
    }

    async GetDepartmentByCode(code: string, includeDeleted: boolean = false): Promise<Department | null>
    {
        const deletedFilter = includeDeleted ? sql`` : sql`AND deleted = false`;

        const result = await this._db.db.execute<DepartmentRow>(sql`
            SELECT
                id,
                code,
                name,
                created_at,
                updated_at,
                created_by,
                updated_by,
                deleted
            FROM ${departmentTable}
            WHERE code = ${code}
              ${deletedFilter}
            LIMIT 1
        `);

        if (result.length === 0)
        {
            return null;
        }

        return this.mapRowToDepartment(result[0]);
    }

    async GetListDepartment(parameters: DepartmentParameter): Promise<PagedResult<Department>>
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

        const [departmentResults, countResult] = await Promise.all([
            this._db.db.execute<DepartmentRow>(sql`
                SELECT
                    id,
                    code,
                    name,
                    created_at,
                    updated_at,
                    created_by,
                    updated_by,
                    deleted
                FROM ${departmentTable}
                ${whereClause}
                ${orderByClause}
                LIMIT ${limit}
                OFFSET ${offset}
            `),
            this._db.db.execute<{ count: number }>(sql`
                SELECT COUNT(*)::int AS count
                FROM ${departmentTable}
                ${whereClause}
            `),
        ]);

        const totalCount = countResult[0]?.count ?? 0;
        const items = Array.from(departmentResults).map((row: DepartmentRow) => this.mapRowToDepartment(row));

        return createPagedResult(items, totalCount, params.pageNumber, params.pageSize);

    }

    async CreateDeparment(department: Department): Promise<Department>
    {
        const result = await this._db.db.execute<DepartmentRow>(sql`
            INSERT INTO ${departmentTable} (
                code,
                name,
                created_by,
                updated_by,
                deleted
            )
            VALUES (
                ${department.code},
                ${department.name},
                ${department.createdBy},
                ${department.updatedBy},
                ${department.deleted}
            )
            RETURNING
                id,
                code,
                name,
                created_at,
                updated_at,
                created_by,
                updated_by,
                deleted
            `);

        return this.mapRowToDepartment(result[0]);
    }

    async UpdateDepartment(department: Partial<Department>): Promise<Department>
    {
        const result = await this._db.db.execute<DepartmentRow>(sql`
            UPDATE ${departmentTable}
            SET
                code = COALESCE(${department.code}, code),
                name = COALESCE(${department.name}, name),
                updated_by = COALESCE(${department.updatedBy}, updated_by),
                deleted = COALESCE(${department.deleted}, deleted),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${department.id}
            RETURNING
                id,
                code,
                name,
                created_at,
                updated_at,
                created_by,
                updated_by,
                deleted
        `);

        return this.mapRowToDepartment(result[0])

    }

    async DeleteDepartment(id: number): Promise<void>
    {
        await this._db.db.execute(sql`
            UPDATE ${departmentTable}
            SET
                deleted = true,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
        `);
    }
}
