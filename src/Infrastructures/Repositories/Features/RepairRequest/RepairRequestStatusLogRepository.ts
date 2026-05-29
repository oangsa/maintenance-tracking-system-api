import { IRepairRequestStatusLogRepository } from "@/Domains/Repositories/IRepairRequestStatusLogRepository";
import { AppDrizzleDB } from "../../../Database";
import { RepairRequestStatusLog } from "@/Infrastructures/Entities/Features/RepairRequest/RepairRequestStatusLog";
import {
    repairRequestStatusLog as repairRequestStatusLogTable,
    repairStatus as repairStatusTable,
    users as usersTable,
} from "@/Infrastructures/Database/Drizzle/schema";
import { sql } from "drizzle-orm";

type RepairRequestStatusLogRow = {
    id: number;
    repair_request_id: number;
    old_status_id: number | null;
    new_status_id: number;
    changed_by: number | null;
    note: string | null;
    changed_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
    // joined old repair_status columns
    old_status_code: string | null;
    old_status_name: string | null;
    // joined new repair_status columns
    new_status_code: string | null;
    new_status_name: string | null;
    // joined users columns
    changed_by_user_name: string | null;
    changed_by_user_email: string | null;
};

export class RepairRequestStatusLogRepository implements IRepairRequestStatusLogRepository
{
    private readonly _db: AppDrizzleDB;

    constructor(db: AppDrizzleDB)
    {
        this._db = db;
    }

    private mapRowToEntity(row: RepairRequestStatusLogRow): RepairRequestStatusLog
    {
        return {
            id: row.id,
            repairRequestId: row.repair_request_id,
            oldStatusId: row.old_status_id,
            newStatusId: row.new_status_id,
            changedBy: row.changed_by,
            note: row.note,
            changedAt: row.changed_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            createdBy: row.created_by,
            updatedBy: row.updated_by,
            oldStatus: row.old_status_code != null
                ? {
                    id: row.old_status_id!,
                    code: row.old_status_code,
                    name: row.old_status_name!,
                }
                : null,
            newStatus: row.new_status_code != null
                ? {
                    id: row.new_status_id,
                    code: row.new_status_code,
                    name: row.new_status_name!,
                }
                : null,
            changedByUser: row.changed_by_user_email != null
                ? {
                    id: row.changed_by!,
                    name: row.changed_by_user_name,
                    email: row.changed_by_user_email,
                }
                : null,
        };
    }

    async CreateStatusLog(log: Omit<RepairRequestStatusLog, "id" | "oldStatus" | "newStatus" | "changedByUser">): Promise<void>
    {
        await this._db.db.execute(sql`
            INSERT INTO ${repairRequestStatusLogTable} (
                repair_request_id,
                old_status_id,
                new_status_id,
                changed_by,
                note,
                changed_at,
                created_at,
                updated_at,
                created_by,
                updated_by
            ) VALUES (
                ${log.repairRequestId},
                ${log.oldStatusId},
                ${log.newStatusId},
                ${log.changedBy},
                ${log.note},
                ${log.changedAt},
                ${log.createdAt},
                ${log.updatedAt},
                ${log.createdBy},
                ${log.updatedBy}
            )
        `);
    }

    async GetStatusLogsByRepairRequestId(repairRequestId: number): Promise<RepairRequestStatusLog[]>
    {
        const innerQuery = sql`
            SELECT
                status_log.id,
                status_log.repair_request_id,
                status_log.old_status_id,
                status_log.new_status_id,
                status_log.changed_by,
                status_log.note,
                status_log.changed_at,
                status_log.created_at,
                status_log.updated_at,
                status_log.created_by,
                status_log.updated_by,
                old_status.code AS old_status_code,
                old_status.name AS old_status_name,
                new_status.code AS new_status_code,
                new_status.name AS new_status_name,
                changed_by_user.name AS changed_by_user_name,
                changed_by_user.email AS changed_by_user_email
            FROM ${repairRequestStatusLogTable} status_log
            LEFT JOIN ${repairStatusTable} old_status ON old_status.id = status_log.old_status_id
            LEFT JOIN ${repairStatusTable} new_status ON new_status.id = status_log.new_status_id
            LEFT JOIN ${usersTable} changed_by_user ON changed_by_user.id = status_log.changed_by
        `;

        const result = await this._db.db.execute<RepairRequestStatusLogRow>(sql`
            SELECT * FROM (${innerQuery}) base
            WHERE base.repair_request_id = ${repairRequestId}
            ORDER BY base.changed_at ASC
        `);

        return Array.from(result).map(row => this.mapRowToEntity(row as RepairRequestStatusLogRow));
    }
}
