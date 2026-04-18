import { IWorkOrderRepository } from "@/Domains/Repositories/IWorkOrderRepository";
import { AppDrizzleDB } from "../../Database";
import { WorkOrder } from "../../Entities/Master/WorkOrder";
import { workOrder as workOrderTable } from "../../Database/Drizzle/schema";
import { sql, SQL } from "drizzle-orm";
import { PagedResult } from "@/Domains/RequestFeatures/Core/PageResult";
import { WorkOrderParameter } from "@/Domains/RequestFeatures/WorkOrderParameter";
import { createPagedResult } from "@/Shared/Utilities/RequestFeatures/CreatePageResult";
import { normalizeRequestParameters } from "@/Shared/Utilities/RequestFeatures/NormalizedRequestParameters";
import { QueryBuilder } from "../Extensions/QueryBuilder";

type WorkOrderRow = {
    id: number;
    repair_request_item_id : number;
    scheduled_start: string;
    scheduled_end: string;
    order_sequence: number;
    is_final: boolean | null;
    status_id: number;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
};


export class WorkOrderRepository implements IWorkOrderRepository
{
    private readonly _db: AppDrizzleDB;

    constructor(db: AppDrizzleDB)
    {
        this._db = db;
    }

    private mapRowToWorkOrder(row: WorkOrderRow): WorkOrder
    {
        return {
            id: row.id,
            repairRequestItemId: row.repair_request_item_id,
            scheduledStart: row.scheduled_start,
            scheduledEnd: row.scheduled_end,
            orderSequence: row.order_sequence,
            isFinal: row.is_final ?? false,
            statusId: row.status_id,
            createdAt: row.created_at ?? "",
            updatedAt: row.updated_at ?? "",
            createdBy: row.created_by,
            updatedBy: row.updated_by,
        };
    }


    async GetWorkOrderById(id: number): Promise<WorkOrder | null>
    {
        const result = await this._db.db.execute<WorkOrderRow>(sql`
            SELECT
                id,
                repair_request_item_id,
                scheduled_start,
                scheduled_end,
                order_sequence,
                is_final,
                status_id,
                created_at,
                updated_at,
                created_by,
                updated_by
            FROM ${workOrderTable}
            WHERE id = ${id}
            LIMIT 1
        `);

        if (result.length === 0 || !result[0])
        {
            return null;
        }

        return this.mapRowToWorkOrder(result[0]);
    }

    async CheckOrderSequenceExists(repairRequestItemId: number, orderSequence: number): Promise<boolean>
    {
        const result = await this._db.db.execute<{ count: number }>(sql`
            SELECT COUNT(*)::int AS count
            FROM ${workOrderTable}
            WHERE repair_request_item_id = ${repairRequestItemId} AND order_sequence = ${orderSequence}
            LIMIT 1
        `);

        return result[0]!.count > 0;
    }


    async GetListWorkOrder(parameters: WorkOrderParameter): Promise<PagedResult<WorkOrder>>
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
        const orderByClause = QueryBuilder.BuildRawSQLOrderQuery(params.orderBy);

        const innerQuery = sql`
            SELECT
                id,
                repair_request_item_id,
                scheduled_start,
                scheduled_end,
                order_sequence,
                is_final,
                status_id,
                created_at,
                updated_at,
                created_by,
                updated_by
            FROM ${workOrderTable}
        `;

        const [WorkOrderResults, countResult] = await Promise.all([
            this._db.db.execute<WorkOrderRow>(sql`
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
        const items = Array.from(WorkOrderResults).map((row: WorkOrderRow) => this.mapRowToWorkOrder(row));

        return createPagedResult(items, totalCount, params.pageNumber, params.pageSize);
    }

    async GetListWorkOrderByRepairRequestId(repairRequestId: number, parameters: WorkOrderParameter): Promise<PagedResult<WorkOrder>>
    {
        const params = normalizeRequestParameters(parameters);
        const offset = (params.pageNumber - 1) * params.pageSize;
        const limit = params.pageSize;

        const whereConditions: SQL[] = [sql`repair_request_item_id = ${repairRequestId}`];

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
                repair_request_item_id,
                scheduled_start,
                scheduled_end,
                order_sequence,
                is_final,
                status_id,
                created_at,
                updated_at,
                created_by,
                updated_by
            FROM ${workOrderTable}
        `;

        const [WorkOrderResults, countResult] = await Promise.all([
            this._db.db.execute<WorkOrderRow>(sql`
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
        const items = Array.from(WorkOrderResults).map((row: WorkOrderRow) => this.mapRowToWorkOrder(row));

        return createPagedResult(items, totalCount, params.pageNumber, params.pageSize);
    }

    async CreateWorkOrder(workOrder: WorkOrder): Promise<WorkOrder>
    {
        const result = await this._db.db.execute<WorkOrderRow>(sql`
            INSERT INTO ${workOrderTable} (
                repair_request_item_id,
                scheduled_start,
                scheduled_end,
                order_sequence,
                is_final,
                status_id,
                created_by,
                updated_by
            )
            VALUES (
                ${workOrder.repairRequestItemId},
                ${workOrder.scheduledStart || null},
                ${workOrder.scheduledEnd || null},
                ${workOrder.orderSequence},
                ${workOrder.isFinal || null},
                ${workOrder.statusId},
                ${workOrder.createdBy},
                ${workOrder.updatedBy}
            )
            RETURNING
                id,
                repair_request_item_id,
                scheduled_start,
                scheduled_end,
                order_sequence,
                is_final,
                status_id,
                created_at,
                updated_at,
                created_by,
                updated_by
        `);

        return this.mapRowToWorkOrder(result[0]!);
    }

    async UpdateWorkOrder(workOrder: Partial<WorkOrder>): Promise<WorkOrder>
    {
        const result = await this._db.db.execute<WorkOrderRow>(sql`
            UPDATE ${workOrderTable}
            SET
                repair_request_item_id = COALESCE(${workOrder.repairRequestItemId || null}, repair_request_item_id),
                scheduled_start = COALESCE(${workOrder.scheduledStart || null}, scheduled_start),
                scheduled_end = COALESCE(${workOrder.scheduledEnd || null}, scheduled_end),
                order_sequence = COALESCE(${workOrder.orderSequence || null}, order_sequence),
                is_final = COALESCE(${workOrder.isFinal || null}, is_final),
                status_id = COALESCE(${workOrder.statusId || null}, status_id),
                updated_by = COALESCE(${workOrder.updatedBy || null}, updated_by),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${workOrder.id}
            RETURNING
                id,
                repair_request_item_id,
                scheduled_start,
                scheduled_end,
                order_sequence,
                is_final,
                status_id,
                created_at,
                updated_at,
                created_by,
                updated_by
        `);

        return this.mapRowToWorkOrder(result[0]!);

    }

    async DeleteWorkOrder(id: number): Promise<void>
    {
        await this._db.db.transaction(async (tx) =>
        {
            const targetResult = await tx.execute(sql`
                SELECT repair_request_item_id, order_sequence
                FROM ${workOrderTable}
                WHERE id = ${id}
            `);

            if (targetResult.length === 0 || !targetResult[0])
            {
                throw new Error(`WorkOrder with id ${id} not found`);
            }

            const target = targetResult[0] as { repair_request_item_id: number; order_sequence: number };

            await tx.execute(sql`
                DELETE FROM ${workOrderTable}
                WHERE id = ${id}
            `);

            await tx.execute(sql`
                UPDATE ${workOrderTable}
                SET order_sequence = order_sequence - 1, updated_at = CURRENT_TIMESTAMP
                WHERE repair_request_item_id = ${target.repair_request_item_id} AND order_sequence > ${target.order_sequence}

            `);
        });
    }

}
