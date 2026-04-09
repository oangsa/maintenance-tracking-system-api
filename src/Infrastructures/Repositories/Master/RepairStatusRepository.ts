import { IRepairStatusRepository } from "../../../Domains/Repositories/IRepairStatusRepository";
import { AppDrizzleDB } from "../../Database";
import { RepairStatus } from "../../Entities/Master/RepairStatus";
import { repairStatus as repairStatusTable } from "../../Database/Drizzle/schema";
import { sql, SQL } from "drizzle-orm";
import { PagedResult } from "../../../Domains/RequestFeatures/Core/PageResult";
import { RepairStatusParameter } from "../../../Domains/RequestFeatures/RepairStatusParameter";
import { createPagedResult } from "../../../Shared/Utilities/RequestFeatures/CreatePageResult";
import { normalizeRequestParameters } from "../../../Shared/Utilities/RequestFeatures/NormalizedRequestParameters";
import { QueryBuilder } from "../Extensions/QueryBuilder";

type RepairStatusRow = {
    id: number;
    code: string;
    name: string;
    order_sequence: number;
    is_final: boolean;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
    deleted: boolean | null;
};

export class RepairStatusRepository implements IRepairStatusRepository
{
    private readonly _db: AppDrizzleDB;

    constructor(db: AppDrizzleDB)
    {
        this._db = db;
    }

    private mapRowToRepairStatus(row: RepairStatusRow): RepairStatus
    {
        return {
            id: row.id,
            code: row.code,
            name: row.name,
            orderSequence: row.order_sequence,
            isFinal: row.is_final,
            createdAt: row.created_at ?? "",
            updatedAt: row.updated_at ?? "",
            createdBy: row.created_by ?? "",
            updatedBy: row.updated_by ?? "",
            deleted: row.deleted ?? false,
        };
    }

    async GetRepairStatusById(id: number): Promise<RepairStatus | null>
    {
        const result = await this._db.db.execute<RepairStatusRow>(sql`
            SELECT id, code, name, order_sequence, is_final, created_at, updated_at, created_by, updated_by, deleted
            FROM ${repairStatusTable}
            WHERE id = ${id} AND deleted = false
        `);

        // ใช้ (result as any) เพื่อเลี่ยง Error ของ TypeScript
        if ((result as any).length === 0) return null;
        return this.mapRowToRepairStatus((result as any)[0]);
    }

    async GetRepairStatusByCode(code: string, includeDeleted: boolean = false): Promise<RepairStatus | null>
    {
        const deletedFilter = includeDeleted ? sql`` : sql`AND deleted = false`;

        const result = await this._db.db.execute<RepairStatusRow>(sql`
            SELECT id, code, name, order_sequence, is_final, created_at, updated_at, created_by, updated_by, deleted
            FROM ${repairStatusTable}
            WHERE code = ${code}
              ${deletedFilter}
            LIMIT 1
        `);

        if ((result as any).length === 0) return null;
        return this.mapRowToRepairStatus((result as any)[0]);
    }

    async GetRepairStatusByName(name: string, includeDeleted: boolean = false): Promise<RepairStatus | null>
    {
        const deletedFilter = includeDeleted ? sql`` : sql`AND deleted = false`;

        const result = await this._db.db.execute<RepairStatusRow>(sql`
            SELECT id, code, name, order_sequence, is_final, created_at, updated_at, created_by, updated_by, deleted
            FROM ${repairStatusTable}
            WHERE name = ${name}
              ${deletedFilter}
            LIMIT 1
        `);

        if ((result as any).length === 0) return null;
        return this.mapRowToRepairStatus((result as any)[0]);
    }

    async GetListRepairStatus(parameters: RepairStatusParameter): Promise<PagedResult<RepairStatus>>
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
        const orderByClause = params.orderBy 
            ? QueryBuilder.BuildRawSQLOrderQuery(params.orderBy)
            : sql`ORDER BY order_sequence ASC`;

        const [results, countResult] = await Promise.all([
            this._db.db.execute<RepairStatusRow>(sql`
                SELECT id, code, name, order_sequence, is_final, created_at, updated_at, created_by, updated_by, deleted
                FROM ${repairStatusTable}
                ${whereClause}
                ${orderByClause}
                LIMIT ${limit}
                OFFSET ${offset}
            `),
            this._db.db.execute<{ count: number }>(sql`
                SELECT COUNT(*)::int AS count
                FROM ${repairStatusTable}
                ${whereClause}
            `),
        ]);

        const totalCount = (countResult as any)[0]?.count ?? 0;
        const items = Array.from(results as any).map((row: any) => this.mapRowToRepairStatus(row as RepairStatusRow));

        return createPagedResult(items, totalCount, params.pageNumber, params.pageSize);
    }

    async CreateRepairStatus(repairStatus: RepairStatus): Promise<RepairStatus>
    {
        const result = await this._db.db.execute<RepairStatusRow>(sql`
            INSERT INTO ${repairStatusTable} (code, name, order_sequence, is_final, created_by, updated_by, deleted)
            VALUES (${repairStatus.code}, ${repairStatus.name}, ${repairStatus.orderSequence}, ${repairStatus.isFinal}, ${repairStatus.createdBy}, ${repairStatus.updatedBy}, false)
            RETURNING id, code, name, order_sequence, is_final, created_at, updated_at, created_by, updated_by, deleted
        `);

        return this.mapRowToRepairStatus((result as any)[0]);
    }

    async UpdateRepairStatus(repairStatus: Partial<RepairStatus>): Promise<RepairStatus>
    {
        const result = await this._db.db.execute<RepairStatusRow>(sql`
            UPDATE ${repairStatusTable}
            SET
                code = COALESCE(${repairStatus.code}, code),
                name = COALESCE(${repairStatus.name}, name),
                order_sequence = COALESCE(${repairStatus.orderSequence}, order_sequence),
                is_final = COALESCE(${repairStatus.isFinal}, is_final),
                updated_by = COALESCE(${repairStatus.updatedBy}, updated_by),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${repairStatus.id}
            RETURNING id, code, name, order_sequence, is_final, created_at, updated_at, created_by, updated_by, deleted
        `);

        return this.mapRowToRepairStatus((result as any)[0]);
    }

    async DeleteRepairStatus(id: number): Promise<void>
    {
        await this._db.db.execute(sql`
            UPDATE ${repairStatusTable}
            SET deleted = true, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
        `);
    }
}