import { IWorkOrderRepository } from "@/Domains/Repositories/IWorkOrderRepository";
import { AppDrizzleDB } from "../../Database";
import { WorkOrder } from "@/Infrastructures/Entities/Master/WorkOrder";
import { workOrder as WorkOrderTable } from "@/Infrastructures/Database/Drizzle/schema";
import { sql, SQL } from "drizzle-orm";
import { PagedResult } from "@/Domains/RequestFeatures/Core/PageResult";
import { WorkOrderParameter } from "@/Domains/RequestFeatures/WorkOrderParameter";
import { createPagedResult } from "@/Shared/Utilities/RequestFeatures/CreatePageResult";
import { normalizeRequestParameters } from "@/Shared/Utilities/RequestFeatures/NormalizedRequestParameters";
import { QueryBuilder } from "../Extensions/QueryBuilder";

type WorkOrderRow = {
    id: number;
    repair_request_id : number;
    schedule_start: string | null;
    scheduled_end: string | null;
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
            repairRequestId: row.repair_request_id,
            scheduledStart: row.schedule_start ?? "",
            scheduledEnd: row.scheduled_end ?? "",
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
                repair_request_id,
                schedule_start,
                scheduled_end,
                order_sequence,
                is_final,
                status_id,
                created_at,
                updated_at,
                created_by,
                updated_by
            FROM ${WorkOrderTable}
            WHERE id = ${id}
            LIMIT 1
        `);

        if (result.length === 0 || !result[0])
        {
            return null;
        }

        return this.mapRowToWorkOrder(result[0]);
    }

    async GetWorkOrderBySequence(repairRequestId: number, orderSequence: number): Promise<WorkOrder | null>
    {
        const result = await this._db.db.execute<WorkOrderRow>(sql`
            SELECT * 
            FROM ${WorkOrderTable}
            WHERE repair_request_id = ${repairRequestId} AND order_sequence = ${orderSequence}
            LIMIT 1
        `);

       if (result.length === 0 || !result[0])
        {
            return null;
        }

        return this.mapRowToWorkOrder(result[0]);
    }


    async GetListWorkOrder(parameters: WorkOrderParameter): Promise<PagedResult<WorkOrder>>
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
                repair_request_id,
                schedule_start,
                scheduled_end,
                order_sequence,
                is_final,
                status_id,
                created_at,
                updated_at,
                created_by,
                updated_by
            FROM ${WorkOrderTable}
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

    async CreateWorkOrder(WorkOrder: WorkOrder): Promise<WorkOrder>
    {
        const result = await this._db.db.execute<WorkOrderRow>(sql`
            INSERT INTO ${WorkOrderTable} (
                repair_request_id,
                schedule_start,
                scheduled_end,
                order_sequence,
                is_final,
                status_id,
                created_by,
                updated_by
            )
            VALUES (
                ${WorkOrder.repairRequestId},
                ${WorkOrder.scheduledStart},
                ${WorkOrder.scheduledEnd},
                ${WorkOrder.orderSequence},
                ${WorkOrder.isFinal},
                ${WorkOrder.statusId},
                ${WorkOrder.createdBy},
                ${WorkOrder.updatedBy},
            )
            RETURNING
                id,
                repair_request_id,
                schedule_start,
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

    async UpdateWorkOrder(WorkOrder: Partial<WorkOrder>): Promise<WorkOrder>
    {
        const result = await this._db.db.execute<WorkOrderRow>(sql`
            UPDATE ${WorkOrderTable}
            SET
                repair_request_id = COALESCE(${WorkOrder.repairRequestId}, repair_request_id),
                schedule_start = COALESCE(${WorkOrder.scheduledStart}, schedule_start),
                scheduled_end = COALESCE(${WorkOrder.scheduledEnd}, scheduled_end),
                order_sequence = COALESCE(${WorkOrder.orderSequence}, order_sequence),
                is_final = COALESCE(${WorkOrder.isFinal}, is_final),
                status_id = COALESCE(${WorkOrder.statusId}, status_id),
                updated_by = COALESCE(${WorkOrder.updatedBy}, updated_by),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${WorkOrder.id}
            RETURNING
                id,
                repair_request_id,
                schedule_start,
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
        await this._db.db.execute(sql`
            UPDATE ${WorkOrderTable}
            SET
                deleted = true,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
        `);
    }
}
