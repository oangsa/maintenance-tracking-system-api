import { IWorkOrderPartRepository } from "@/Domains/Repositories/IWorkOrderPartRepository";
import { AppDrizzleDB } from "../../Database";
import { WorkOrderPart } from "../../Entities/Master/WorkOrderPart";
import { workOrderPart as workOrderPartTable, part as partTable } from "../../Database/Drizzle/schema";
import { sql, SQL } from "drizzle-orm";
import { PagedResult } from "@/Domains/RequestFeatures/Core/PageResult";
import { WorkOrderPartParameter } from "@/Domains/RequestFeatures/WorkOrderPartParameter";
import { createPagedResult } from "@/Shared/Utilities/RequestFeatures/CreatePageResult";
import { normalizeRequestParameters } from "@/Shared/Utilities/RequestFeatures/NormalizedRequestParameters";
import { QueryBuilder } from "../Extensions/QueryBuilder";

type WorkOrderPartRow = {
    id: number;
    work_order_id: number;
    part_id: number;
    part_code: string | null;
    part_name: string | null;
    quantity: number;
    note: string | null;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
    
};

export class WorkOrderPartRepository implements IWorkOrderPartRepository
{
    private readonly _db: AppDrizzleDB;

    constructor(db: AppDrizzleDB)
    {
        this._db = db;
    }

    private mapRowToWorkOrderPart(row: WorkOrderPartRow): WorkOrderPart
    {
        return {
            id: row.id,
            workOrderId: row.work_order_id,
            partId: row.part_id,
            partCode: row.part_code,
            partName: row.part_name,
            quantity: row.quantity,
            note: row.note,
            createdAt: row.created_at!,
            updatedAt: row.updated_at!,
            createdBy: row.created_by,
            updatedBy: row.updated_by,
            part: row.part_id ? { id: row.part_id, code: row.part_code!, name: row.part_name! } : null,
           
        };
    }

    async GetWorkOrderPartById(id: number): Promise<WorkOrderPart | null>
    {
        const result = await this._db.db.execute<WorkOrderPartRow>(sql`
            SELECT
                wop.id,
                wop.work_order_id,
                wop.part_id,
                p.code AS part_code,
                p.name AS part_name,
                wop.quantity,
                wop.note,
                wop.created_at,
                wop.updated_at,
                wop.created_by,
                wop.updated_by
            FROM ${workOrderPartTable} wop
            LEFT JOIN ${partTable} p ON wop.part_id = p.id
            WHERE wop.id = ${id}
        `);

        if (result.length === 0) return null;

        return this.mapRowToWorkOrderPart(result[0]!);
    }

    async GetListWorkOrderPart(parameters: WorkOrderPartParameter): Promise<PagedResult<WorkOrderPart>>
    {
        const params = normalizeRequestParameters(parameters);
        const offset = (params.pageNumber - 1) * params.pageSize;
        const limit = params.pageSize;

        const whereConditions: SQL[] = [];

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

        const whereClause = whereConditions.length > 0 ? sql`WHERE ${sql.join(whereConditions, sql` AND `)}` : sql``;
        const orderByClause = QueryBuilder.BuildRawSQLOrderQuery( params.orderBy?.replace(/\bpartId\b/g, "part_id"));

        const innerQuery = sql`
            SELECT
                wop.id,
                wop.work_order_id,
                wop.part_id,
                p.code AS part_code,
                p.name AS part_name,
                wop.quantity,
                wop.note,
                wop.created_at,
                wop.updated_at,
                wop.created_by,
                wop.updated_by
            FROM ${workOrderPartTable} wop
            LEFT JOIN ${partTable} p ON wop.part_id = p.id
        `;

        const [WorkOrderPartresults, countResult] = await Promise.all([
            this._db.db.execute<WorkOrderPartRow>(sql`
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
        const items = Array.from(WorkOrderPartresults).map((row: WorkOrderPartRow) => this.mapRowToWorkOrderPart(row));

        return createPagedResult(items, totalCount, params.pageNumber, params.pageSize);
    }

    async CreateWorkOrderPart(workOrderPart: WorkOrderPart): Promise<WorkOrderPart>
    {
        console.log("Creating WorkOrderPart with data:", workOrderPart);
        const result = await this._db.db.execute<WorkOrderPartRow>(sql`
            WITH inserted AS (
                INSERT INTO ${workOrderPartTable} (
                    work_order_id,
                    part_id,
                    quantity,
                    note,
                    created_by,
                    updated_by
                )
                VALUES (
                    ${workOrderPart.workOrderId},
                    ${workOrderPart.partId},
                    ${workOrderPart.quantity},
                    ${workOrderPart.note},
                    ${workOrderPart.createdBy},
                    ${workOrderPart.updatedBy}
                )
                RETURNING *
            )
            SELECT 
                i.id,
                i.work_order_id,
                i.part_id,
                p.code AS part_code,
                p.name AS part_name,
                i.quantity,
                i.note,
                i.created_at,
                i.updated_at,
                i.created_by,
                i.updated_by
            FROM inserted i
            LEFT JOIN ${partTable} p ON i.part_id = p.id
        `);

        return this.mapRowToWorkOrderPart(result[0]!);
    }

    async UpdateWorkOrderPart(workOrderPart: Partial<WorkOrderPart>): Promise<WorkOrderPart>
    {
        const result = await this._db.db.execute<WorkOrderPartRow>(sql`
            WITH updated AS (
                UPDATE ${workOrderPartTable}
                SET
                    quantity = COALESCE(${workOrderPart.quantity}, quantity),
                    note = COALESCE(${workOrderPart.note}, note),
                    updated_by = COALESCE(${workOrderPart.updatedBy}, updated_by),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ${workOrderPart.id}
                RETURNING *
            )
            SELECT 
                u.id,
                u.work_order_id,
                u.part_id,
                p.code AS part_code,
                p.name AS part_name,
                u.quantity,
                u.note,
                u.created_at,
                u.updated_at,
                u.created_by,
                u.updated_by
            FROM updated u
            LEFT JOIN ${partTable} p ON u.part_id = p.id
        `);

        return this.mapRowToWorkOrderPart(result[0]!);
    }

    async DeleteWorkOrderPart(id: number): Promise<void>
    {
        await this._db.db.execute(sql`
            DELETE FROM ${workOrderPartTable}
            WHERE id = ${id}
        `);
    }
}