import { IWorkTaskRepository } from "@/Domains/Repositories/IWorkTaskRepository";
import { AppDrizzleDB } from "../../Database";
import { WorkTask } from "@/Infrastructures/Entities/Master/WorkTask";
import { workTask as workTaskTable } from "../../Database/Drizzle/schema";
import { sql, SQL } from "drizzle-orm";
import { PagedResult } from "@/Domains/RequestFeatures/Core/PageResult";
import { WorkTaskParameter } from "@/Domains/RequestFeatures/WorkTaskParameter";
import { createPagedResult } from "@/Shared/Utilities/RequestFeatures/CreatePageResult";
import { normalizeRequestParameters } from "@/Shared/Utilities/RequestFeatures/NormalizedRequestParameters";
import { QueryBuilder } from "../Extensions/QueryBuilder";
import { WorkTaskAssignment } from "@/Infrastructures/Entities/Master/WorkTaskAssignment";


type WorkTaskRow = {
    id: number;
    work_order_id: number;
    description: string;
    note: string | null;
    started_at: string | null;
    ended_at: string | null;
    assignee_id: number | null;
    assignee_name: string | null;
    assignee_email: string | null;
    assigned_by_id: number | null;
    assigned_by_name: string | null;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
};

export class WorkTaskRepository implements IWorkTaskRepository
{
    private readonly _db: AppDrizzleDB;
    
    constructor(db: AppDrizzleDB)
    {
        this._db = db;
    }  
    private mapRowToWorkTask(row: WorkTaskRow): WorkTask
    {
        return {
            id: row.id,
            workOrderId: row.work_order_id,
            description: row.description,
            note: row.note,
            startedAt: row.started_at,
            endedAt: row.ended_at,
            assigneeId: row.assignee_id,
            assigneeName: row.assignee_name,
            assigneeEmail: row.assignee_email,
            assignedById: row.assigned_by_id,
            assignedByName: row.assigned_by_name,
            createdAt: row.created_at!,
            updatedAt: row.updated_at!,
            createdBy: row.created_by,
            updatedBy: row.updated_by,
        };
    }

    private getBaseSelectQuery(): SQL
    {
        return sql`
            SELECT 
                wt.id,
                wt.work_order_id,
                wt.description,
                wt.note,
                wt.started_at,
                wt.ended_at,
                wta.assignee_id,
                u_assignee.name AS assignee_name,
                u_assignee.email AS assignee_email,
                wta.assigned_by AS assigned_by_id,
                u_assigner.name AS assigned_by_name,
                wt.created_at,
                wt.updated_at,
                wt.created_by,
                wt.updated_by
            FROM ${workTaskTable} AS wt
            LEFT JOIN work_task_assignment wta ON wt.id = wta.work_task_id AND wta.unassigned_at IS NULL
            LEFT JOIN users u_assignee ON wta.assignee_id = u_assignee.id
            LEFT JOIN users u_assigner ON wta.assigned_by = u_assigner.id

        `;
    }

    async GetWorkTaskById(id: number): Promise<WorkTask | null>
    {
        const baseQuery = this.getBaseSelectQuery();
        const result = await this._db.db.execute<WorkTaskRow>(sql`
            ${baseQuery}
            WHERE wt.id = ${id}
        `);
        if (result.length === 0) return null;
        return this.mapRowToWorkTask(result[0]!);
    }

    async GetListWorkTask(parameters: WorkTaskParameter): Promise<PagedResult<WorkTask>>
    {
        const params = normalizeRequestParameters(parameters);
        const offset = (params.pageNumber - 1) * params.pageSize;
        const limit = params.pageSize;

        const whereConditions: SQL[] = [];
        if (params.workOrderId !== undefined)
        {
            whereConditions.push(sql`work_order_id = ${params.workOrderId}`);
        }

        if (params.assigneeId !== undefined)
        {
            whereConditions.push(sql`assignee_id = ${params.assigneeId}`);
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

        const whereClause = whereConditions.length > 0 ? sql`WHERE ${sql.join(whereConditions, sql` AND `)}` : sql``;
        const orderByClause = QueryBuilder.BuildRawSQLOrderQuery(params.orderBy);
        const innerQuery = this.getBaseSelectQuery();

        const [results, countResult] = await Promise.all([
            this._db.db.execute<WorkTaskRow>(sql`
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
        const items = Array.from(results).map((row: WorkTaskRow) => this.mapRowToWorkTask(row));
        
        return createPagedResult(items, totalCount, params.pageNumber, params.pageSize);

    }

    async CheckWorkTaskExistsByOrderId(workOrderId: number): Promise<boolean>
    {
        const result = await this._db.db.execute<{ id: number }>(sql`
            SELECT id
            FROM ${workTaskTable}
            WHERE work_order_id = ${workOrderId}
            LIMIT 1
        `);
        return result.length > 0;
    }

    async CheckUsersShareDepartment(userId1: number, userId2: number): Promise<boolean>
    {
        if (userId1 === userId2) return true; 
        const result = await this._db.db.execute<{ count: number }>(sql`
            SELECT COUNT(*)::int AS count
            FROM user_department ud1
            JOIN user_department ud2 ON ud1.department_id = ud2.department_id
            WHERE ud1.user_id = ${userId1} AND ud2.user_id = ${userId2}
        `);
        return (result[0]?.count ?? 0) > 0;
    }

    async GetAssignmentHistory(workTaskId: number): Promise<WorkTaskAssignment[]>
    {
        type AssignmentRow = {
            id: number;
            work_task_id: number;
            assignee_id: number;
            assignee_name: string | null;
            assignee_email: string | null;
            assigned_by_id: number;
            assigned_by_name: string | null;
            assigned_at: string;
            unassigned_at: string | null;
            created_at: string | null;
            updated_at: string | null;
            created_by: string | null;
            updated_by: string | null;
        };

        const result = await this._db.db.execute<AssignmentRow>(sql`
            SELECT 
                wta.id,
                wta.work_task_id,
                wta.assignee_id,
                u_assignee.name AS assignee_name,
                u_assignee.email AS assignee_email,
                wta.assigned_by AS assigned_by_id,
                u_assigner.name AS assigned_by_name,
                wta.assigned_at,
                wta.unassigned_at,
                wta.created_at,
                wta.updated_at,
                wta.created_by,
                wta.updated_by
            FROM work_task_assignment wta
            LEFT JOIN users u_assignee ON wta.assignee_id = u_assignee.id
            LEFT JOIN users u_assigner ON wta.assigned_by = u_assigner.id
            WHERE wta.work_task_id = ${workTaskId}
            ORDER BY wta.assigned_at ASC
        `);

        return result.map(row => ({
            id: row.id,
            workTaskId: row.work_task_id,
            assigneeId: row.assignee_id,
            assigneeName: row.assignee_name,
            assigneeEmail: row.assignee_email,
            assignedById: row.assigned_by_id,
            assignedByName: row.assigned_by_name,
            assignedAt: row.assigned_at,
            unassignedAt: row.unassigned_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            createdBy: row.created_by,
            updatedBy: row.updated_by,
        }));


    }

    async CreateWorkTask(task: Partial<WorkTask>, assigneeId?: number, assignedById?: number): Promise<WorkTask>
    {
        console.log("Creating work task with data:", task, "AssigneeId:", assigneeId, "AssignedById:", assignedById);
        const createResult = await this._db.db.execute<WorkTaskRow>(sql`
            INSERT INTO ${workTaskTable} (
                work_order_id, 
                description, 
                note, 
                started_at, 
                ended_at, 
                created_by, 
                updated_by
            )
            VALUES (
                ${task.workOrderId}, 
                ${task.description}, 
                ${task.note}, 
                ${task.startedAt}, 
                ${task.endedAt || null}, 
                ${task.createdBy}, 
                ${task.updatedBy}
            )
            RETURNING id
        `);

        const newTaskId = createResult[0]!.id;
        if (assigneeId && assignedById)
        {
            await this.AssignWorkTask(newTaskId, assigneeId, assignedById,task.createdBy!);
        }

        const fullTask = await this.GetWorkTaskById(newTaskId);
        if (!fullTask) throw new Error("Failed to retrieve newly created work task.");
        return fullTask;

    }

    async UpdateWorkTask(task: Partial<WorkTask>): Promise<WorkTask>
    {
        const result = await this._db.db.execute<WorkTaskRow>(sql`
            UPDATE ${workTaskTable}
            SET 
                description = COALESCE(${task.description}, description),
                note = COALESCE(${task.note}, note),
                started_at = COALESCE(${task.startedAt}, started_at),
                ended_at = COALESCE(${task.endedAt}, ended_at),
                updated_by = COALESCE(${task.updatedBy}, updated_by),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${task.id}
            RETURNING id
        `);

        const updatedId = result[0]!.id;
        const fullTask = await this.GetWorkTaskById(updatedId);
        return fullTask!;
    }

    async AssignWorkTask(workTaskId: number, assigneeId: number, assignedById: number, actionByName?: string): Promise<void>
    {
        await this._db.db.execute(sql`
            UPDATE work_task_assignment
            SET unassigned_at = CURRENT_TIMESTAMP,
                updated_by = ${actionByName ?? null},
                updated_at = CURRENT_TIMESTAMP
            WHERE work_task_id = ${workTaskId} 
            AND unassigned_at IS NULL
        `);
        await this._db.db.execute(sql`
            INSERT INTO work_task_assignment (
                work_task_id,
                assignee_id,
                assigned_by,
                created_by,
                updated_by,
                assigned_at,
                created_at,
                updated_at
            
            )
            VALUES (
                ${workTaskId},
                ${assigneeId},
                ${assignedById},
                ${actionByName ?? null},
                ${actionByName ?? null},
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            )
        `);
    }

    async UnassignWorkTask(workTaskId: number, actionByName?: string): Promise<void>
    {
        await this._db.db.execute(sql`
            UPDATE work_task_assignment
            SET 
                unassigned_at = CURRENT_TIMESTAMP,
                updated_by = ${actionByName ?? null},
                updated_at = CURRENT_TIMESTAMP
            WHERE work_task_id = ${workTaskId} 
            AND unassigned_at IS NULL
        `);
    }

    async DeleteWorkTask(id: number): Promise<void>
    {
        await this._db.db.execute(sql`
            DELETE FROM ${workTaskTable}
            WHERE id = ${id}
        `);
    }



    


}
