import { IRepairRequestItemStatusRepository } from "@/Domains/Repositories/IRepairRequestItemStatusRepository";
import { AppDrizzleDB } from "../../Database";
import { RepairRequestItemStatus } from "@/Infrastructures/Entities/Master/RepairRequestItemStatus";
import { repairRequestItemStatus as repairRequestItemStatusTable } from "@/Infrastructures/Database/Drizzle/schema";
import { sql, SQL } from "drizzle-orm";
import { PagedResult } from "@/Domains/RequestFeatures/Core/PageResult";
import { RepairRequestItemStatusParameter } from "@/Domains/RequestFeatures/RepairRequestItemStatusParameter";
import { createPagedResult } from "@/Shared/Utilities/RequestFeatures/CreatePageResult";
import { normalizeRequestParameters } from "@/Shared/Utilities/RequestFeatures/NormalizedRequestParameters";
import { QueryBuilder } from "../Extensions/QueryBuilder";

type RepairRequestItemStatusRow = {
    id: number;
    code: string;
    name: string;
    order_sequence: number;
    is_final: boolean | null;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
    deleted: boolean | null;
};

export class RepairRequestItemStatusRepository implements IRepairRequestItemStatusRepository
{
    private readonly _db: AppDrizzleDB;

    constructor(db: AppDrizzleDB)
    {
        this._db = db;
    }

    private mapRowToRepairRequestItemStatus(row: RepairRequestItemStatusRow): RepairRequestItemStatus
    {
        return {
            id: row.id,
            code: row.code,
            name: row.name,
            orderSequence: row.order_sequence,
            isFinal: row.is_final ?? false,
            createdAt: row.created_at ?? "",
            updatedAt: row.updated_at ?? "",
            createdBy: row.created_by,
            updatedBy: row.updated_by,
            deleted: row.deleted ?? false,
        };
    }

    async GetRepairRequestItemStatusById(id: number): Promise<RepairRequestItemStatus | null>
    {
        const result = await this._db.db.execute<RepairRequestItemStatusRow>(sql`
            SELECT
                id,
                code,
                name,
                order_sequence,
                is_final,
                created_at,
                updated_at,
                created_by,
                updated_by,
                deleted
            FROM ${repairRequestItemStatusTable}
            WHERE id = ${id}
            LIMIT 1
        `);

        if (result.length === 0 || !result[0])
        {
            return null;
        }

        return this.mapRowToRepairRequestItemStatus(result[0]);
    }

    async GetRepairRequestItemStatusByCode(code: string, includeDeleted: boolean = false): Promise<RepairRequestItemStatus | null>
    {
        const deletedFilter = includeDeleted ? sql`` : sql`AND deleted = false`;

        const result = await this._db.db.execute<RepairRequestItemStatusRow>(sql`
            SELECT
                id,
                code,
                name,
                order_sequence,
                is_final,
                created_at,
                updated_at,
                created_by,
                updated_by,
                deleted
            FROM ${repairRequestItemStatusTable}
            WHERE code = ${code}
              ${deletedFilter}
            LIMIT 1
        `);

        if (result.length === 0 || !result[0])
        {
            return null;
        }

        return this.mapRowToRepairRequestItemStatus(result[0]);
    }

    async GetListRepairRequestItemStatus(parameters: RepairRequestItemStatusParameter): Promise<PagedResult<RepairRequestItemStatus>>
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

        const innerQuery = sql`
            SELECT
                id,
                code,
                name,
                order_sequence,
                is_final,
                created_at,
                updated_at,
                created_by,
                updated_by,
                deleted
            FROM ${repairRequestItemStatusTable}
        `;

        const [repairRequestItemStatusResults, countResult] = await Promise.all([
            this._db.db.execute<RepairRequestItemStatusRow>(sql`
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
        const items = Array.from(repairRequestItemStatusResults).map((row: RepairRequestItemStatusRow) => this.mapRowToRepairRequestItemStatus(row));

        return createPagedResult(items, totalCount, params.pageNumber, params.pageSize);
    }

    async CreateRepairRequestItemStatus(repairRequestItemStatus: RepairRequestItemStatus): Promise<RepairRequestItemStatus>
    {
        const result = await this._db.db.execute<RepairRequestItemStatusRow>(sql`
            INSERT INTO ${repairRequestItemStatusTable} (
                code,
                name,
                order_sequence,
                is_final,
                created_by,
                updated_by,
                deleted
            )
            VALUES (
                ${repairRequestItemStatus.code},
                ${repairRequestItemStatus.name},
                ${repairRequestItemStatus.orderSequence},
                ${repairRequestItemStatus.isFinal},
                ${repairRequestItemStatus.createdBy},
                ${repairRequestItemStatus.updatedBy},
                ${repairRequestItemStatus.deleted}
            )
            RETURNING
                id,
                code,
                name,
                order_sequence,
                is_final,
                created_at,
                updated_at,
                created_by,
                updated_by,
                deleted
        `);

        return this.mapRowToRepairRequestItemStatus(result[0]!);
    }

    async UpdateRepairRequestItemStatus(repairRequestItemStatus: Partial<RepairRequestItemStatus>): Promise<RepairRequestItemStatus>
    {
        const result = await this._db.db.execute<RepairRequestItemStatusRow>(sql`
            UPDATE ${repairRequestItemStatusTable}
            SET
                code = COALESCE(${repairRequestItemStatus.code}, code),
                name = COALESCE(${repairRequestItemStatus.name}, name),
                order_sequence = COALESCE(${repairRequestItemStatus.orderSequence}, order_sequence),
                is_final = COALESCE(${repairRequestItemStatus.isFinal}, is_final),
                updated_by = COALESCE(${repairRequestItemStatus.updatedBy}, updated_by),
                deleted = COALESCE(${repairRequestItemStatus.deleted}, deleted),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${repairRequestItemStatus.id}
            RETURNING
                id,
                code,
                name,
                order_sequence,
                is_final,
                created_at,
                updated_at,
                created_by,
                updated_by,
                deleted
        `);

        return this.mapRowToRepairRequestItemStatus(result[0]!);
    }

    async DeleteRepairRequestItemStatus(id: number): Promise<void>
    {
        await this._db.db.execute(sql`
            UPDATE ${repairRequestItemStatusTable}
            SET
                deleted = true,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
        `);
    }
}
