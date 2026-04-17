import { IPartRepository } from "../../../Domains/Repositories/IPartRepository";
import { AppDrizzleDB } from "../../Database";
import { Part } from "../../Entities/Master/Part";
import { part as partTable } from "../../Database/Drizzle/schema";
import { sql, SQL } from "drizzle-orm";
import { PagedResult } from "../../../Domains/RequestFeatures/Core/PageResult";
import { PartParameter } from "../../../Domains/RequestFeatures/PartParameter";
import { createPagedResult } from "../../../Shared/Utilities/RequestFeatures/CreatePageResult";
import { normalizeRequestParameters } from "../../../Shared/Utilities/RequestFeatures/NormalizedRequestParameters";
import { QueryBuilder } from "../Extensions/QueryBuilder";



type PartRow = {
    id: number;
    code: string;
    name: string;
    product_type_id: number;
    product_type_code: string | null;
    product_type_name: string | null;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
    deleted: boolean | null;
};

export class PartRepository implements IPartRepository
{
    private readonly _db: AppDrizzleDB;

    constructor(db: AppDrizzleDB)
    {
        this._db = db;
    }

    private mapRowToPart(row: PartRow): Part
    {
        return {
            id: row.id,
            code: row.code,
            name: row.name,
            productTypeId: row.product_type_id,
            productTypeCode: row.product_type_code ?? '',
            productTypeName: row.product_type_name ?? '',
            createdAt: row.created_at ?? '',
            updatedAt: row.updated_at ?? '',
            createdBy: row.created_by,
            updatedBy: row.updated_by,
            deleted: row.deleted ?? false,
        };
    }

    async GetPartById(id: number): Promise<Part | null>
    {
        const result = await this._db.db.execute<PartRow>(sql`

            SELECT
                p.id,
                p.code,
                p.name,
                pt.id As product_type_id,
                pt.code AS product_type_code,
                pt.name AS product_type_name,
                p.created_at,
                p.updated_at,
                p.created_by,
                p.updated_by,
                p.deleted
            FROM ${partTable} p
            Join product_type pt on pt.id = p.product_type_id
            WHERE p.id = ${id} AND p.deleted = false
            limit 1
        `);

        if (result.length === 0)
        {
            return null;
        }

        return this.mapRowToPart(result[0]!);
    }

    async GetPartByCode(code: string, includeDeleted: boolean = false): Promise<Part | null>
    {
        const deletedFilter = includeDeleted ? sql`` : sql`AND deleted = false`;

        const result = await this._db.db.execute<PartRow>(sql`
           SELECT
                p.id,
                p.code,
                p.name,
                pt.id As product_type_id,
                pt.code AS product_type_code,
                pt.name AS product_type_name,
                p.created_at,
                p.updated_at,
                p.created_by,
                p.updated_by,
                p.deleted
            FROM ${partTable} p
            Join product_type pt on pt.id = p.product_type_id
            WHERE p.code = ${code}
              ${deletedFilter}
            LIMIT 1
        `);

        if (result.length === 0)
        {
            return null;
        }

        return this.mapRowToPart(result[0]!);
    }

    async GetListPart(parameters: PartParameter): Promise<PagedResult<Part>>
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
                p.id,
                p.code,
                p.name,
                pt.id AS product_type_id,
                pt.code AS product_type_code,
                pt.name AS product_type_name,
                p.created_at,
                p.updated_at,
                p.created_by,
                p.updated_by,
                p.deleted
            FROM ${partTable} p
            JOIN product_type pt ON pt.id = p.product_type_id
        `;

        const [partResults, countResult] = await Promise.all([
            this._db.db.execute<PartRow>(sql`
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
        const items = Array.from(partResults).map((row: PartRow) => this.mapRowToPart(row));

        return createPagedResult(items, totalCount, params.pageNumber, params.pageSize);

    }

    async CreatePart(part: Part): Promise<Part>
    {
        console.log(part);
        const result = await this._db.db.execute<PartRow>(sql`
            INSERT INTO ${partTable} (
                code,
                name,
                product_type_id,
                created_by,
                updated_by,
                deleted
            )
            VALUES (
                ${part.code},
                ${part.name},
                ${part.productTypeId},
                ${part.createdBy},
                ${part.updatedBy},
                ${part.deleted}
            )
            RETURNING
                id,
                code,
                name,
                product_type_id,
                created_at,
                updated_at,
                created_by,
                updated_by,
                deleted
            `);

        return this.mapRowToPart(result[0]!);
    }

    async UpdatePart(part: Partial<Part>): Promise<Part>
    {
        const result = await this._db.db.execute<PartRow>(sql`
            UPDATE ${partTable}
            SET
                code = COALESCE(${part.code}, code),
                name = COALESCE(${part.name}, name),
                product_type_id = COALESCE(${part.productTypeId}, product_type_id),
                updated_by = COALESCE(${part.updatedBy}, updated_by),
                deleted = COALESCE(${part.deleted}, deleted),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${part.id}
            RETURNING
                id,
                code,
                name,
                product_type_id,
                created_at,
                updated_at,
                created_by,
                updated_by,
                deleted
        `);

        return this.mapRowToPart(result[0]!)

    }

    async DeletePart(id: number): Promise<void>
    {
        await this._db.db.execute(sql`
            UPDATE ${partTable}
            SET
                deleted = true,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
        `);
    }
}
