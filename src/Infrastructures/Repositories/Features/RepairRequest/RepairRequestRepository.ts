import { IRepairRequestRepository } from "@/Domains/Repositories/IRepairRequestRepository";
import { AppDrizzleDB } from "../../../Database";
import { RepairRequest } from "@/Infrastructures/Entities/Features/RepairRequest/RepairRequest";
import { RepairRequestItem } from "@/Infrastructures/Entities/Features/RepairRequest/RepairRequestItem";
import {
    repairRequest as repairRequestTable,
    repairRequestItem as repairRequestItemTable,
    repairStatus as repairStatusTable,
    repairRequestItemStatus as repairRequestItemStatusTable,
    product as productTable,
    users as usersTable,
} from "@/Infrastructures/Database/Drizzle/schema";
import { sql, SQL } from "drizzle-orm";
import { PagedResult } from "@/Domains/RequestFeatures/Core/PageResult";
import { RepairRequestParameter } from "@/Domains/RequestFeatures/RepairRequestParameter";
import { RepairRequestItemParameter } from "@/Domains/RequestFeatures/RepairRequestItemParameter";
import { createPagedResult } from "@/Shared/Utilities/RequestFeatures/CreatePageResult";
import { normalizeRequestParameters } from "@/Shared/Utilities/RequestFeatures/NormalizedRequestParameters";
import { QueryBuilder } from "../../Extensions/QueryBuilder";

type RepairRequestRow = {
    id: number;
    request_no: string;
    requester_id: number;
    priority: string;
    requested_at: string | null;
    current_status_id: number;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
    // joined repair_status columns
    current_status_code: string | null;
    current_status_name: string | null;
    current_status_order_sequence: number | null;
    current_status_is_final: boolean | null;
    // joined users columns
    requester_email: string | null;
    requester_name: string | null;
    requester_role: string | null;
};

type RepairRequestItemRow = {
    id: number;
    repair_request_id: number;
    product_id: number;
    description: string;
    quantity: number;
    repair_status_id: number | null;
    department_id: number;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
    // joined product columns
    product_code: string | null;
    product_name: string | null;
    product_type_id: number | null;
    // joined repair_request_item_status columns
    repair_status_code: string | null;
    repair_status_name: string | null;
    repair_status_order_sequence: number | null;
    repair_status_is_final: boolean | null;
};

export class RepairRequestRepository implements IRepairRequestRepository
{
    private readonly _db: AppDrizzleDB;

    constructor(db: AppDrizzleDB)
    {
        this._db = db;
    }

    private mapRowToRepairRequest(row: RepairRequestRow, items: RepairRequestItem[]): RepairRequest
    {
        return {
            id: row.id,
            requestNo: row.request_no,
            requesterId: row.requester_id,
            priority: row.priority as RepairRequest["priority"],
            requestedAt: row.requested_at,
            currentStatusId: row.current_status_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            createdBy: row.created_by,
            updatedBy: row.updated_by,
            currentStatus: row.current_status_code != null
                ? {
                    id: row.current_status_id,
                    code: row.current_status_code!,
                    name: row.current_status_name!,
                    orderSequence: row.current_status_order_sequence!,
                    isFinal: row.current_status_is_final ?? false,
                }
                : null,
            requester: row.requester_email != null
                ? {
                    id: row.requester_id,
                    email: row.requester_email!,
                    name: row.requester_name,
                    role: row.requester_role!,
                }
                : null,
            requestedItems: items,
        };
    }

    private mapRowToRepairRequestItem(row: RepairRequestItemRow): RepairRequestItem
    {
        return {
            id: row.id,
            repairRequestId: row.repair_request_id,
            productId: row.product_id,
            description: row.description,
            quantity: row.quantity,
            repairStatusId: row.repair_status_id,
            departmentId: row.department_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            createdBy: row.created_by,
            updatedBy: row.updated_by,
            product: row.product_code != null
                ? {
                    id: row.product_id,
                    code: row.product_code!,
                    name: row.product_name!,
                    productTypeId: row.product_type_id!,
                }
                : null,
            repairStatus: row.repair_status_code != null
                ? {
                    id: row.repair_status_id!,
                    code: row.repair_status_code!,
                    name: row.repair_status_name!,
                    orderSequence: row.repair_status_order_sequence!,
                    isFinal: row.repair_status_is_final ?? false,
                }
                : null,
        };
    }

    private async loadItemsForRepairRequestIds(ids: number[]): Promise<Map<number, RepairRequestItem[]>>
    {
        if (ids.length === 0) return new Map();

        const idsSQL = sql.join(ids.map(id => sql`${id}`), sql`, `);

        const itemRows = await this._db.db.execute<RepairRequestItemRow>(sql`
            SELECT
                ri.id,
                ri.repair_request_id,
                ri.product_id,
                ri.description,
                ri.quantity,
                ri.repair_status_id,
                ri.department_id,
                ri.created_at,
                ri.updated_at,
                ri.created_by,
                ri.updated_by,
                p.code AS product_code,
                p.name AS product_name,
                p.product_type_id AS product_type_id,
                rris.code AS repair_status_code,
                rris.name AS repair_status_name,
                rris.order_sequence AS repair_status_order_sequence,
                rris.is_final AS repair_status_is_final
            FROM ${repairRequestItemTable} ri
            LEFT JOIN ${productTable} p ON p.id = ri.product_id
            LEFT JOIN ${repairRequestItemStatusTable} rris ON rris.id = ri.repair_status_id
            WHERE ri.repair_request_id IN (${idsSQL})
            ORDER BY ri.id ASC
        `);

        const itemMap = new Map<number, RepairRequestItem[]>();

        for (const row of itemRows)
        {
            const item = this.mapRowToRepairRequestItem(row as RepairRequestItemRow);
            const existing = itemMap.get(item.repairRequestId) ?? [];
            existing.push(item);
            itemMap.set(item.repairRequestId, existing);
        }

        return itemMap;
    }

    async GetRepairRequestById(id: number): Promise<RepairRequest | null>
    {
        const result = await this._db.db.execute<RepairRequestRow>(sql`
            SELECT
                rr.id,
                rr.request_no,
                rr.requester_id,
                rr.priority,
                rr.requested_at,
                rr.current_status_id,
                rr.created_at,
                rr.updated_at,
                rr.created_by,
                rr.updated_by,
                rs.code AS current_status_code,
                rs.name AS current_status_name,
                rs.order_sequence AS current_status_order_sequence,
                rs.is_final AS current_status_is_final,
                u.email AS requester_email,
                u.name AS requester_name,
                u.role AS requester_role
            FROM ${repairRequestTable} rr
            LEFT JOIN ${repairStatusTable} rs ON rs.id = rr.current_status_id
            LEFT JOIN ${usersTable} u ON u.id = rr.requester_id
            WHERE rr.id = ${id}
              AND rr.deleted = false
            LIMIT 1
        `);

        if (result.length === 0 || !result[0])
        {
            return null;
        }

        const itemMap = await this.loadItemsForRepairRequestIds([id]);
        return this.mapRowToRepairRequest(result[0] as RepairRequestRow, itemMap.get(id) ?? []);
    }

    async GetRepairRequestByRequestNo(requestNo: string, includeDeleted: boolean = false): Promise<RepairRequest | null>
    {
        const deletedFilter = includeDeleted ? sql`` : sql`AND rr.deleted = false`;

        const result = await this._db.db.execute<RepairRequestRow>(sql`
            SELECT
                rr.id,
                rr.request_no,
                rr.requester_id,
                rr.priority,
                rr.requested_at,
                rr.current_status_id,
                rr.created_at,
                rr.updated_at,
                rr.created_by,
                rr.updated_by,
                rs.code AS current_status_code,
                rs.name AS current_status_name,
                rs.order_sequence AS current_status_order_sequence,
                rs.is_final AS current_status_is_final,
                u.email AS requester_email,
                u.name AS requester_name,
                u.role AS requester_role
            FROM ${repairRequestTable} rr
            LEFT JOIN ${repairStatusTable} rs ON rs.id = rr.current_status_id
            LEFT JOIN ${usersTable} u ON u.id = rr.requester_id
            WHERE rr.request_no = ${requestNo}
              ${deletedFilter}
            LIMIT 1
        `);

        if (result.length === 0 || !result[0])
        {
            return null;
        }

        const row = result[0] as RepairRequestRow;
        const itemMap = await this.loadItemsForRepairRequestIds([row.id]);
        return this.mapRowToRepairRequest(row, itemMap.get(row.id) ?? []);
    }

    async GetListRepairRequest(parameters: RepairRequestParameter): Promise<PagedResult<RepairRequest>>
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
                rr.id,
                rr.request_no,
                rr.requester_id,
                rr.priority,
                rr.requested_at,
                rr.current_status_id,
                rr.created_at,
                rr.updated_at,
                rr.created_by,
                rr.updated_by,
                rr.deleted,
                rs.code AS current_status_code,
                rs.name AS current_status_name,
                rs.order_sequence AS current_status_order_sequence,
                rs.is_final AS current_status_is_final,
                u.email AS requester_email,
                u.name AS requester_name,
                u.role AS requester_role
            FROM ${repairRequestTable} rr
            LEFT JOIN ${repairStatusTable} rs ON rs.id = rr.current_status_id
            LEFT JOIN ${usersTable} u ON u.id = rr.requester_id
        `;

        const [repairRequestResults, countResult] = await Promise.all([
            this._db.db.execute<RepairRequestRow>(sql`
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

        const rows = Array.from(repairRequestResults) as RepairRequestRow[];
        const totalCount = countResult[0]?.count ?? 0;

        if (rows.length === 0)
        {
            return createPagedResult([], totalCount, params.pageNumber, params.pageSize);
        }

        const ids = rows.map(r => r.id);
        const itemMap = await this.loadItemsForRepairRequestIds(ids);

        const items = rows.map(row => this.mapRowToRepairRequest(row, itemMap.get(row.id) ?? []));

        return createPagedResult(items, totalCount, params.pageNumber, params.pageSize);
    }

    async CreateRepairRequest(repairRequest: RepairRequest): Promise<RepairRequest>
    {
        const insertedResult = await this._db.db.execute<{ id: number }>(sql`
            INSERT INTO ${repairRequestTable} (
                request_no,
                requester_id,
                priority,
                current_status_id,
                created_by,
                updated_by,
                deleted
            )
            VALUES (
                ${repairRequest.requestNo},
                ${repairRequest.requesterId},
                ${repairRequest.priority},
                ${repairRequest.currentStatusId},
                ${repairRequest.createdBy},
                ${repairRequest.updatedBy},
                false
            )
            RETURNING id
        `);

        const newId = insertedResult[0]!.id;

        if (repairRequest.requestedItems.length > 0)
        {
            for (const item of repairRequest.requestedItems)
            {
                await this._db.db.execute(sql`
                    INSERT INTO ${repairRequestItemTable} (
                        repair_request_id,
                        product_id,
                        description,
                        quantity,
                        repair_status_id,
                        department_id,
                        created_by,
                        updated_by
                    )
                    VALUES (
                        ${newId},
                        ${item.productId},
                        ${item.description},
                        ${item.quantity},
                        ${item.repairStatusId ?? 1},
                        ${item.departmentId},
                        ${item.createdBy},
                        ${item.updatedBy}
                    )
                `);
            }
        }

        const created = await this.GetRepairRequestById(newId);
        return created!;
    }

    async UpdateRepairRequest(repairRequest: Partial<RepairRequest>): Promise<RepairRequest>
    {
        await this._db.db.execute(sql`
            UPDATE ${repairRequestTable}
            SET
                priority = COALESCE(${repairRequest.priority ?? null}, priority),
                current_status_id = COALESCE(${repairRequest.currentStatusId ?? null}, current_status_id),
                updated_by = COALESCE(${repairRequest.updatedBy ?? null}, updated_by),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${repairRequest.id}
        `);

        const updated = await this.GetRepairRequestById(repairRequest.id!);
        return updated!;
    }

    async GetListRepairRequestItemsByRequestId(repairRequestId: number, parameters: RepairRequestItemParameter): Promise<PagedResult<RepairRequestItem>>
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
                ri.id,
                ri.repair_request_id,
                ri.product_id,
                ri.description,
                ri.quantity,
                ri.repair_status_id,
                ri.department_id,
                ri.created_at,
                ri.updated_at,
                ri.created_by,
                ri.updated_by,
                p.code AS product_code,
                p.name AS product_name,
                p.product_type_id AS product_type_id,
                rris.code AS repair_status_code,
                rris.name AS repair_status_name,
                rris.order_sequence AS repair_status_order_sequence,
                rris.is_final AS repair_status_is_final
            FROM ${repairRequestItemTable} ri
            LEFT JOIN ${productTable} p ON p.id = ri.product_id
            LEFT JOIN ${repairRequestItemStatusTable} rris ON rris.id = ri.repair_status_id
        `;

        const [itemResults, countResult] = await Promise.all([
            this._db.db.execute<RepairRequestItemRow>(sql`
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

        const rows = Array.from(itemResults) as RepairRequestItemRow[];
        const totalCount = countResult[0]?.count ?? 0;
        const items = rows.map(row => this.mapRowToRepairRequestItem(row));

        return createPagedResult(items, totalCount, params.pageNumber, params.pageSize);
    }

    async DeleteRepairRequest(id: number): Promise<void>
    {
        await this._db.db.execute(sql`
            UPDATE ${repairRequestTable}
            SET
                deleted = true,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
        `);
    }

    private async createRepairRequestItem(repairRequestId: number, item: RepairRequestItem): Promise<RepairRequestItem>
    {
        const insertedResult = await this._db.db.execute<{ id: number }>(sql`
            INSERT INTO ${repairRequestItemTable} (
                repair_request_id,
                product_id,
                description,
                quantity,
                repair_status_id,
                department_id,
                created_by,
                updated_by
            )
            VALUES (
                ${repairRequestId},
                ${item.productId},
                ${item.description},
                ${item.quantity},
                ${item.repairStatusId ?? 1},
                ${item.departmentId},
                ${item.createdBy},
                ${item.updatedBy}
            )
            RETURNING id
        `);

        const newId = insertedResult[0]!.id;

        const itemRows = await this._db.db.execute<RepairRequestItemRow>(sql`
            SELECT
                ri.id,
                ri.repair_request_id,
                ri.product_id,
                ri.description,
                ri.quantity,
                ri.repair_status_id,
                ri.department_id,
                ri.created_at,
                ri.updated_at,
                ri.created_by,
                ri.updated_by,
                p.code AS product_code,
                p.name AS product_name,
                p.product_type_id AS product_type_id,
                rris.code AS repair_status_code,
                rris.name AS repair_status_name,
                rris.order_sequence AS repair_status_order_sequence,
                rris.is_final AS repair_status_is_final
            FROM ${repairRequestItemTable} ri
            LEFT JOIN ${productTable} p ON p.id = ri.product_id
            LEFT JOIN ${repairRequestItemStatusTable} rris ON rris.id = ri.repair_status_id
            WHERE ri.id = ${newId}
            LIMIT 1
        `);

        return this.mapRowToRepairRequestItem(itemRows[0] as RepairRequestItemRow);
    }

    async CreateRepairRequestItems(repairRequestId: number, items: RepairRequestItem[]): Promise<RepairRequestItem[]>
    {
        if (items.length === 0) return [];

        const createdItems: RepairRequestItem[] = [];

        for (const item of items)
        {
            const created = await this.createRepairRequestItem(repairRequestId, item);
            createdItems.push(created);
        }

        return createdItems;
    }
}
