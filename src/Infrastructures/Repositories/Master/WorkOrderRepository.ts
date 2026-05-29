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
    is_final: boolean;
    status_id: number | null;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
    repair_request_id?: number;
    repair_request_item_description?: string;
    repair_request_item_repair_status_name?: string;
    repair_request_item_repair_status_code?: string;
    repair_request_item_repair_status_order_sequence?: number | null;
    repair_request_item_repair_status_is_final?: boolean | null;
    repair_request_item_product_id?: number | null;
    repair_request_item_product_code?: string | null;
    repair_request_item_product_name?: string | null;
    repair_request_item_product_type_id?: number | null;
    repair_request_request_no?: string;
    work_task_id?: number | null;
    work_task_description?: string | null;
    work_task_note?: string | null;
    work_task_started_at?: string | null;
    work_task_ended_at?: string | null;
    work_task_assignee_id?: number | null;
    work_task_assignee_name?: string | null;
    work_task_assignee_email?: string | null;
    work_task_assigned_by_user_id?: number | null;
    work_task_assigned_by_user_name?: string | null;
    work_task_assignment_assigned_at?: string | null;
    work_task_assignment_unassigned_at?: string | null;
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
            scheduledStart: row.scheduled_start ? String(row.scheduled_start) : "",
            scheduledEnd: row.scheduled_end ? String(row.scheduled_end) : "",
            orderSequence: row.order_sequence,
            isFinal: row.is_final ?? false,
            createdAt: row.created_at ?? null,
            updatedAt: row.updated_at ?? null,
            createdBy: row.created_by,
            updatedBy: row.updated_by,
            repairRequestItem: {
                id: row.repair_request_item_id,
                description: row.repair_request_item_description ?? "",
                repairStatusId: row.status_id,
                product: row.repair_request_item_product_id !== null && row.repair_request_item_product_id !== undefined
                    ? {
                        id: row.repair_request_item_product_id,
                        code: row.repair_request_item_product_code ?? "",
                        name: row.repair_request_item_product_name ?? "",
                        productTypeId: row.repair_request_item_product_type_id ?? 0,
                    }
                    : null,
                repairStatus: row.status_id !== null
                    ? {
                        id: row.status_id,
                        code: row.repair_request_item_repair_status_code ?? "",
                        name: row.repair_request_item_repair_status_name ?? "",
                        orderSequence: row.repair_request_item_repair_status_order_sequence ?? 0,
                        isFinal: row.repair_request_item_repair_status_is_final ?? false,
                    }
                    : null,
            },
            repairRequestRequestNo: row.repair_request_request_no ?? null,
            workTask: row.work_task_id !== null && row.work_task_id !== undefined
                ? {
                    id: row.work_task_id,
                    description: row.work_task_description ?? "",
                    note: row.work_task_note ?? null,
                    startedAt: row.work_task_started_at ? String(row.work_task_started_at) : null,
                    endedAt: row.work_task_ended_at ? String(row.work_task_ended_at) : null,
                    assigneeId: row.work_task_assignee_id ?? null,
                    assigneeName: row.work_task_assignee_name ?? null,
                    assigneeEmail: row.work_task_assignee_email ?? null,
                    assignedById: row.work_task_assigned_by_user_id ?? null,
                    assignedByName: row.work_task_assigned_by_user_name ?? null,
                    assignedAt: row.work_task_assignment_assigned_at ? String(row.work_task_assignment_assigned_at) : null,
                    unassignedAt: row.work_task_assignment_unassigned_at ? String(row.work_task_assignment_unassigned_at) : null,
                }
                : null,
        };
    }


    async GetWorkOrderById(id: number): Promise<WorkOrder | null>
    {
        const result = await this._db.db.execute<WorkOrderRow>(sql`
            SELECT
                work_order.id,
                work_order.repair_request_item_id,
                work_order.scheduled_start,
                work_order.scheduled_end,
                work_order.order_sequence,
                false AS is_final,
                repair_request_item.repair_status_id AS status_id,
                work_order.created_at,
                work_order.updated_at,
                work_order.created_by,
                work_order.updated_by,
                repair_request_item.description AS repair_request_item_description,
                repair_request_item_status.name AS repair_request_item_repair_status_name,
                repair_request_item_status.code AS repair_request_item_repair_status_code,
                repair_request_item_status.order_sequence AS repair_request_item_repair_status_order_sequence,
                repair_request_item_status.is_final AS repair_request_item_repair_status_is_final,
                product.id AS repair_request_item_product_id,
                product.code AS repair_request_item_product_code,
                product.name AS repair_request_item_product_name,
                product.product_type_id AS repair_request_item_product_type_id,
                repair_request.request_no AS repair_request_request_no,
                repair_request.request_no AS work_order_no,
                work_task.id AS work_task_id,
                work_task.description AS work_task_description,
                work_task.note AS work_task_note,
                work_task.started_at AS work_task_started_at,
                work_task.ended_at AS work_task_ended_at,
                work_task_assignment.assignee_id AS work_task_assignee_id,
                work_task_assignee_user.name AS work_task_assignee_name,
                work_task_assignee_user.email AS work_task_assignee_email,
                work_task_assignment.assigned_by AS work_task_assigned_by_user_id,
                work_task_assigned_by_user.name AS work_task_assigned_by_user_name,
                work_task_assignment.assigned_at AS work_task_assignment_assigned_at,
                work_task_assignment.unassigned_at AS work_task_assignment_unassigned_at
            FROM ${workOrderTable} work_order
            LEFT JOIN repair_request_item ON work_order.repair_request_item_id = repair_request_item.id
            LEFT JOIN repair_request_item_status ON repair_request_item.repair_status_id = repair_request_item_status.id
            LEFT JOIN product ON repair_request_item.product_id = product.id
            LEFT JOIN repair_request ON repair_request_item.repair_request_id = repair_request.id
            LEFT JOIN work_task ON work_order.id = work_task.work_order_id
            LEFT JOIN work_task_assignment
                ON work_task.id = work_task_assignment.work_task_id
                AND work_task_assignment.unassigned_at IS NULL
            LEFT JOIN users work_task_assignee_user ON work_task_assignment.assignee_id = work_task_assignee_user.id
            LEFT JOIN users work_task_assigned_by_user ON work_task_assignment.assigned_by = work_task_assigned_by_user.id
            WHERE work_order.id = ${id}
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

    async GetDepartmentIdByWorkOrderId(workOrderId: number): Promise<number | null>
    {
        const result = await this._db.db.execute<{ repair_request_item_department_id: number }>(sql`
            SELECT
                repair_request_item.department_id AS repair_request_item_department_id
            FROM ${workOrderTable} work_order
            JOIN repair_request_item repair_request_item
                ON repair_request_item.id = work_order.repair_request_item_id
            WHERE work_order.id = ${workOrderId}
            LIMIT 1
        `);

        if (result.length === 0 || !result[0])
        {
            return null;
        }

        return result[0].repair_request_item_department_id;
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
                work_order.id,
                work_order.repair_request_item_id,
                repair_request_item.repair_request_id,
                work_order.scheduled_start,
                work_order.scheduled_end,
                work_order.order_sequence,
                false AS is_final,
                repair_request_item.repair_status_id AS status_id,
                work_order.created_at,
                work_order.updated_at,
                work_order.created_by,
                work_order.updated_by,
                repair_request_item.description AS repair_request_item_description,
                repair_request_item_status.name AS repair_request_item_repair_status_name,
                repair_request_item_status.code AS repair_request_item_repair_status_code,
                repair_request_item_status.order_sequence AS repair_request_item_repair_status_order_sequence,
                repair_request_item_status.is_final AS repair_request_item_repair_status_is_final,
                product.id AS repair_request_item_product_id,
                product.code AS repair_request_item_product_code,
                product.name AS repair_request_item_product_name,
                product.product_type_id AS repair_request_item_product_type_id,
                repair_request.request_no AS repair_request_request_no,
                repair_request.request_no AS work_order_no,
                work_task.id AS work_task_id,
                work_task.description AS work_task_description,
                work_task.note AS work_task_note,
                work_task.started_at AS work_task_started_at,
                work_task.ended_at AS work_task_ended_at,
                work_task_assignment.assignee_id AS work_task_assignee_id,
                work_task_assignee_user.name AS work_task_assignee_name,
                work_task_assignee_user.email AS work_task_assignee_email,
                work_task_assignment.assigned_by AS work_task_assigned_by_user_id,
                work_task_assigned_by_user.name AS work_task_assigned_by_user_name,
                work_task_assignment.assigned_at AS work_task_assignment_assigned_at,
                work_task_assignment.unassigned_at AS work_task_assignment_unassigned_at
            FROM ${workOrderTable} work_order
            LEFT JOIN repair_request_item ON work_order.repair_request_item_id = repair_request_item.id
            LEFT JOIN repair_request_item_status ON repair_request_item.repair_status_id = repair_request_item_status.id
            LEFT JOIN product ON repair_request_item.product_id = product.id
            LEFT JOIN repair_request ON repair_request_item.repair_request_id = repair_request.id
            LEFT JOIN work_task ON work_order.id = work_task.work_order_id
            LEFT JOIN work_task_assignment
                ON work_task.id = work_task_assignment.work_task_id
                AND work_task_assignment.unassigned_at IS NULL
            LEFT JOIN users work_task_assignee_user ON work_task_assignment.assignee_id = work_task_assignee_user.id
            LEFT JOIN users work_task_assigned_by_user ON work_task_assignment.assigned_by = work_task_assigned_by_user.id
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

        const whereConditions: SQL[] = [sql`repair_request_id = ${repairRequestId}`];

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
                work_order.id,
                work_order.repair_request_item_id,
                repair_request_item.repair_request_id,
                work_order.scheduled_start,
                work_order.scheduled_end,
                work_order.order_sequence,
                false AS is_final,
                repair_request_item.repair_status_id AS status_id,
                work_order.created_at,
                work_order.updated_at,
                work_order.created_by,
                work_order.updated_by,
                repair_request_item.description AS repair_request_item_description,
                repair_request_item_status.name AS repair_request_item_repair_status_name,
                repair_request_item_status.code AS repair_request_item_repair_status_code,
                repair_request_item_status.order_sequence AS repair_request_item_repair_status_order_sequence,
                repair_request_item_status.is_final AS repair_request_item_repair_status_is_final,
                product.id AS repair_request_item_product_id,
                product.code AS repair_request_item_product_code,
                product.name AS repair_request_item_product_name,
                product.product_type_id AS repair_request_item_product_type_id,
                repair_request.request_no AS repair_request_request_no,
                repair_request.request_no AS work_order_no,
                work_task.id AS work_task_id,
                work_task.description AS work_task_description,
                work_task.note AS work_task_note,
                work_task.started_at AS work_task_started_at,
                work_task.ended_at AS work_task_ended_at,
                work_task_assignment.assignee_id AS work_task_assignee_id,
                work_task_assignee_user.name AS work_task_assignee_name,
                work_task_assignee_user.email AS work_task_assignee_email,
                work_task_assignment.assigned_by AS work_task_assigned_by_user_id,
                work_task_assigned_by_user.name AS work_task_assigned_by_user_name,
                work_task_assignment.assigned_at AS work_task_assignment_assigned_at,
                work_task_assignment.unassigned_at AS work_task_assignment_unassigned_at
            FROM ${workOrderTable} work_order
            LEFT JOIN repair_request_item ON work_order.repair_request_item_id = repair_request_item.id
            LEFT JOIN repair_request_item_status ON repair_request_item.repair_status_id = repair_request_item_status.id
            LEFT JOIN product ON repair_request_item.product_id = product.id
            LEFT JOIN repair_request ON repair_request_item.repair_request_id = repair_request.id
            LEFT JOIN work_task ON work_order.id = work_task.work_order_id
            LEFT JOIN work_task_assignment
                ON work_task.id = work_task_assignment.work_task_id
                AND work_task_assignment.unassigned_at IS NULL
            LEFT JOIN users work_task_assignee_user ON work_task_assignment.assignee_id = work_task_assignee_user.id
            LEFT JOIN users work_task_assigned_by_user ON work_task_assignment.assigned_by = work_task_assigned_by_user.id
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
                created_by,
                updated_by
            )
            VALUES (
                ${workOrder.repairRequestItemId},
                ${workOrder.scheduledStart || null},
                ${workOrder.scheduledEnd || null},
                ${workOrder.orderSequence},
                ${workOrder.createdBy},
                ${workOrder.updatedBy}
            )
            RETURNING
                id,
                repair_request_item_id
        `);

        return (await this.GetWorkOrderById(result[0]!.id))!;
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
                updated_by = COALESCE(${workOrder.updatedBy || null}, updated_by),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${workOrder.id}
            RETURNING
                id
        `);

        return (await this.GetWorkOrderById(result[0]!.id))!;

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
