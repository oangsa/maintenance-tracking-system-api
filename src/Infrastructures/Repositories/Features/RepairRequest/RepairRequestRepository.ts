import { IRepairRequestRepository } from "@/Domains/Repositories/IRepairRequestRepository";
import { AppDrizzleDB } from "../../../Database";
import { RepairRequest } from "@/Infrastructures/Entities/Features/RepairRequest/RepairRequest";
import { RepairRequestItem } from "@/Infrastructures/Entities/Features/RepairRequest/RepairRequestItem";
import {
    department as departmentTable,
    repairRequest as repairRequestTable,
    repairRequestItem as repairRequestItemTable,
    repairStatus as repairStatusTable,
    repairRequestItemStatus as repairRequestItemStatusTable,
    product as productTable,
    users as usersTable,
    productType as productTypeTable,
} from "@/Infrastructures/Database/Drizzle/schema";
import { sql, SQL } from "drizzle-orm";
import { PagedResult } from "@/Domains/RequestFeatures/Core/PageResult";
import { RepairRequestParameter } from "@/Domains/RequestFeatures/RepairRequestParameter";
import { RepairRequestItemParameter } from "@/Domains/RequestFeatures/RepairRequestItemParameter";
import { BadRequestMessageException } from "@/Domains/Exceptions/BadRequestException";
import { createPagedResult } from "@/Shared/Utilities/RequestFeatures/CreatePageResult";
import { normalizeRequestParameters } from "@/Shared/Utilities/RequestFeatures/NormalizedRequestParameters";
import { QueryBuilder } from "../../Extensions/QueryBuilder";
import { RepairRequestCountGroupByStatus } from "@/Infrastructures/Entities/Reports/RepairRequestCountGroupByStatus";
import { TopRepairedProductsPerformanceReportDto } from "@/Applications/DataTransferObjects/RepairRequest/TopRepairedProductsPerformanceReportDto";
import { MonthlyRepairTrendByProductTypeReport } from "@/Applications/DataTransferObjects/RepairRequest/MonthlyRepairTrendByProductTypeReportDto";

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

type RepairRequestCntGroupByStatusRow = {
    current_status_id: number;
    current_status_name: string;
    value: number;
};

type TopRepairedProductsPerformanceReportRow = {
    productName: string;
    value: number;
};

export class RepairRequestRepository implements IRepairRequestRepository
{
    private readonly _db: AppDrizzleDB;

    constructor(db: AppDrizzleDB)
    {
        this._db = db;
    }

    private mapRowToRepairRequestCountGroupByStatus(row: RepairRequestCntGroupByStatusRow): RepairRequestCountGroupByStatus
    {
        return {
            statusName: row.current_status_name,
            value: row.value,
        };
    }

    private validateNumericSearchValue( searches: Array<{ name?: string; value?: string }> | undefined, numericFieldName: string, codeFieldName: string,): void
    {
        if (!searches || searches.length === 0)
        {
            return;
        }

        for (const search of searches)
        {
            if (search.name?.toLowerCase() !== numericFieldName)
            {
                continue;
            }

            if (!search.value || search.value.trim() === '')
            {
                continue;
            }

            if (!Number.isNaN(Number(search.value)))
            {
                continue;
            }

            throw new BadRequestMessageException(
                `${numericFieldName} expects a numeric ID. Use ${codeFieldName} for business codes such as P001.`,
            );
        }
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
                repair_request_item.id,
                repair_request_item.repair_request_id,
                repair_request_item.product_id,
                repair_request_item.description,
                repair_request_item.quantity,
                repair_request_item.repair_status_id,
                repair_request_item.department_id,
                repair_request_item.created_at,
                repair_request_item.updated_at,
                repair_request_item.created_by,
                repair_request_item.updated_by,
                product.code AS product_code,
                product.name AS product_name,
                product.product_type_id AS product_type_id,
                item_status.code AS repair_status_code,
                item_status.name AS repair_status_name,
                item_status.order_sequence AS repair_status_order_sequence,
                item_status.is_final AS repair_status_is_final
            FROM ${repairRequestItemTable} repair_request_item
            LEFT JOIN ${productTable} product ON product.id = repair_request_item.product_id
            LEFT JOIN ${repairRequestItemStatusTable} item_status ON item_status.id = repair_request_item.repair_status_id
            WHERE repair_request_item.repair_request_id IN (${idsSQL})
            ORDER BY repair_request_item.id ASC
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
                repair_request.id,
                repair_request.request_no,
                repair_request.requester_id,
                repair_request.priority,
                repair_request.requested_at,
                repair_request.current_status_id,
                repair_request.created_at,
                repair_request.updated_at,
                repair_request.created_by,
                repair_request.updated_by,
                current_status.code AS current_status_code,
                current_status.name AS current_status_name,
                current_status.order_sequence AS current_status_order_sequence,
                current_status.is_final AS current_status_is_final,
                requester.email AS requester_email,
                requester.name AS requester_name,
                requester.role AS requester_role
            FROM ${repairRequestTable} repair_request
            LEFT JOIN ${repairStatusTable} current_status ON current_status.id = repair_request.current_status_id
            LEFT JOIN ${usersTable} requester ON requester.id = repair_request.requester_id
            WHERE repair_request.id = ${id}
              AND repair_request.deleted = false
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
        const deletedFilter = includeDeleted ? sql`` : sql`AND repair_request.deleted = false`;

        const result = await this._db.db.execute<RepairRequestRow>(sql`
            SELECT
                repair_request.id,
                repair_request.request_no,
                repair_request.requester_id,
                repair_request.priority,
                repair_request.requested_at,
                repair_request.current_status_id,
                repair_request.created_at,
                repair_request.updated_at,
                repair_request.created_by,
                repair_request.updated_by,
                current_status.code AS current_status_code,
                current_status.name AS current_status_name,
                current_status.order_sequence AS current_status_order_sequence,
                current_status.is_final AS current_status_is_final,
                requester.email AS requester_email,
                requester.name AS requester_name,
                requester.role AS requester_role
            FROM ${repairRequestTable} repair_request
            LEFT JOIN ${repairStatusTable} current_status ON current_status.id = repair_request.current_status_id
            LEFT JOIN ${usersTable} requester ON requester.id = repair_request.requester_id
            WHERE repair_request.request_no = ${requestNo}
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

        const ITEM_PREFIX = 'repair_request_items_';

        this.validateNumericSearchValue(
            params.search,
            `${ITEM_PREFIX}department_id`,
            `${ITEM_PREFIX}department_code`,
        );

        const mainSearch = (params.search ?? []).filter(s => !s.name?.startsWith(ITEM_PREFIX));
        const itemSearch = (params.search ?? [])
            .filter(s => s.name?.startsWith(ITEM_PREFIX))
            .map(s => ({ ...s, name: `item_base.${s.name!.slice(ITEM_PREFIX.length)}` }));

        let mainSearchTerm = params.searchTerm;
        let itemSearchTermFields: string[] = [];

        if (params.searchTerm?.name)
        {
            const allFields = params.searchTerm.name.split(',').map(f => f.trim());
            const mainFields = allFields.filter(f => !f.startsWith(ITEM_PREFIX));
            const itemFields = allFields
                .filter(f => f.startsWith(ITEM_PREFIX))
                .map(f => `item_base.${f.slice(ITEM_PREFIX.length)}`);

            mainSearchTerm = mainFields.length > 0
                ? { name: mainFields.join(','), value: params.searchTerm.value }
                : undefined;
            itemSearchTermFields = itemFields;
        }

        const whereConditions: SQL[] = [sql`deleted = ${params.deleted ?? false}`];

        if (mainSearch.length > 0)
        {
            const filterSQL = QueryBuilder.BuildRawSQLFilterExpression(mainSearch);
            if (filterSQL) whereConditions.push(filterSQL);
        }

        if (mainSearchTerm)
        {
            const searchSQL = QueryBuilder.BuildRawSQLSearchExpression(mainSearchTerm);
            if (searchSQL) whereConditions.push(searchSQL);
        }

        const itemConditions: SQL[] = [];

        if (itemSearch.length > 0)
        {
            const filterSQL = QueryBuilder.BuildRawSQLFilterExpression(itemSearch);
            if (filterSQL) itemConditions.push(filterSQL);
        }

        if (itemSearchTermFields.length > 0)
        {
            const termConditions = itemSearchTermFields.map(field =>
            {
                const parts = field.split('.');
                const fieldSQL = sql.join(parts.map(p => sql.identifier(p)), sql.raw('.'));
                return sql`${fieldSQL} ILIKE ${`%${params.searchTerm!.value}%`}`;
            });
            itemConditions.push(sql`(${sql.join(termConditions, sql` OR `)})`);
        }

        if (itemConditions.length > 0)
        {
            const itemWhereSQL = sql.join(itemConditions, sql` AND `);
            const itemSubquery = sql`
                SELECT
                    repair_request_item.repair_request_id,
                    repair_request_item.department_id,
                    product.code AS product_code,
                    product.name AS product_name,
                    department.code AS department_code,
                    department.name AS department_name,
                    item_status.code AS repair_status_code,
                    item_status.name AS repair_status_name,
                    repair_request_item.description,
                    repair_request_item.quantity
                FROM ${repairRequestItemTable} repair_request_item
                LEFT JOIN ${productTable} product ON product.id = repair_request_item.product_id
                LEFT JOIN ${departmentTable} department ON department.id = repair_request_item.department_id
                LEFT JOIN ${repairRequestItemStatusTable} item_status ON item_status.id = repair_request_item.repair_status_id
            `;
            whereConditions.push(sql`EXISTS (
                SELECT 1 FROM (${itemSubquery}) item_base
                WHERE item_base.repair_request_id = base.id
                AND ${itemWhereSQL}
            )`);
        }

        const whereClause = sql`WHERE ${sql.join(whereConditions, sql` AND `)}`;
        const orderByClause = QueryBuilder.BuildRawSQLOrderQuery(params.orderBy);

        const innerQuery = sql`
            SELECT
                repair_request.id,
                repair_request.request_no,
                repair_request.requester_id,
                repair_request.priority,
                repair_request.requested_at,
                repair_request.current_status_id,
                repair_request.created_at,
                repair_request.updated_at,
                repair_request.created_by,
                repair_request.updated_by,
                repair_request.deleted,
                current_status.code AS current_status_code,
                current_status.name AS current_status_name,
                current_status.order_sequence AS current_status_order_sequence,
                current_status.is_final AS current_status_is_final,
                requester.email AS requester_email,
                requester.name AS requester_name,
                requester.role AS requester_role
            FROM ${repairRequestTable} repair_request
            LEFT JOIN ${repairStatusTable} current_status ON current_status.id = repair_request.current_status_id
            LEFT JOIN ${usersTable} requester ON requester.id = repair_request.requester_id
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

        this.validateNumericSearchValue(params.search, 'department_id', 'department_code');

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
                repair_request_item.id,
                repair_request_item.repair_request_id,
                repair_request_item.product_id,
                repair_request_item.description,
                repair_request_item.quantity,
                repair_request_item.repair_status_id,
                repair_request_item.department_id,
                repair_request_item.created_at,
                repair_request_item.updated_at,
                repair_request_item.created_by,
                repair_request_item.updated_by,
                product.code AS product_code,
                product.name AS product_name,
                product.product_type_id AS product_type_id,
                department.code AS department_code,
                department.name AS department_name,
                item_status.code AS repair_status_code,
                item_status.name AS repair_status_name,
                item_status.order_sequence AS repair_status_order_sequence,
                item_status.is_final AS repair_status_is_final
            FROM ${repairRequestItemTable} repair_request_item
            LEFT JOIN ${productTable} product ON product.id = repair_request_item.product_id
            LEFT JOIN ${departmentTable} department ON department.id = repair_request_item.department_id
            LEFT JOIN ${repairRequestItemStatusTable} item_status ON item_status.id = repair_request_item.repair_status_id
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
                repair_request_item.id,
                repair_request_item.repair_request_id,
                repair_request_item.product_id,
                repair_request_item.description,
                repair_request_item.quantity,
                repair_request_item.repair_status_id,
                repair_request_item.department_id,
                repair_request_item.created_at,
                repair_request_item.updated_at,
                repair_request_item.created_by,
                repair_request_item.updated_by,
                product.code AS product_code,
                product.name AS product_name,
                product.product_type_id AS product_type_id,
                item_status.code AS repair_status_code,
                item_status.name AS repair_status_name,
                item_status.order_sequence AS repair_status_order_sequence,
                item_status.is_final AS repair_status_is_final
            FROM ${repairRequestItemTable} repair_request_item
            LEFT JOIN ${productTable} product ON product.id = repair_request_item.product_id
            LEFT JOIN ${repairRequestItemStatusTable} item_status ON item_status.id = repair_request_item.repair_status_id
            WHERE repair_request_item.id = ${newId}
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

    async GetRepairRequestCountGroupByStatus(params: RepairRequestParameter): Promise<PagedResult<RepairRequestCountGroupByStatus>>
    {
        const normalizedParams = normalizeRequestParameters(params);

        const whereConditions: SQL[] = [sql`repair_request.deleted = ${normalizedParams.deleted ?? false}`];

        if (normalizedParams.search && normalizedParams.search.length > 0)
        {
            const filterSQL = QueryBuilder.BuildRawSQLFilterExpression(normalizedParams.search);
            if (filterSQL) whereConditions.push(filterSQL);
        }

        if (normalizedParams.searchTerm)
        {
            const searchSQL = QueryBuilder.BuildRawSQLSearchExpression(normalizedParams.searchTerm);
            if (searchSQL) whereConditions.push(searchSQL);
        }

        const whereClause = sql`WHERE ${sql.join(whereConditions, sql` AND `)}`;
        const innerQuery = sql`
            SELECT
                current_status.id AS current_status_id,
                current_status.name AS current_status_name,
                current_status.order_sequence AS current_status_order_sequence,
                COUNT(DISTINCT repair_request.id)::int AS value
            FROM ${repairRequestTable} repair_request
            LEFT JOIN ${repairStatusTable} current_status ON current_status.id = repair_request.current_status_id
            ${whereClause}
            GROUP BY current_status.id, current_status.name, current_status.order_sequence
        `;

        const normalizedOrderBy = normalizedParams.orderBy
            ?.replace(/\bcurrentStatusId\b/g, "current_status_id")
            ?.replace(/\bstatusName\b/g, "current_status_name")
            ?.replace(/\bcurrentStatusOrderSequence\b/g, "current_status_order_sequence")
            ?.replace(/\borderSequence\b/g, "current_status_order_sequence");

        const orderByClause = QueryBuilder.BuildRawSQLOrderQuery(
            normalizedOrderBy ?? "current_status_order_sequence asc",
        );

        const query = sql`
            SELECT
                base.current_status_id,
                base.current_status_name,
                base.value
            FROM (${innerQuery}) base
            ${orderByClause}
        `;

        const result = await this._db.db.execute<RepairRequestCntGroupByStatusRow>(query);

        const mapped = Array.from(result).map(row => this.mapRowToRepairRequestCountGroupByStatus(row));

        return createPagedResult(mapped, mapped.length, normalizedParams.pageNumber, normalizedParams.pageSize);
    }

    async GetTopRepairedProductsPerformanceReport(parameters: RepairRequestParameter): Promise<TopRepairedProductsPerformanceReportDto[]>
    {

        const normalizedParams = normalizeRequestParameters(parameters);

        const whereConditions: SQL[] = [sql`repair_request.deleted = ${normalizedParams.deleted ?? false}`];

    let lowerBound: string | null = null;
    let upperBound: string | null = null;

        if (normalizedParams.search && normalizedParams.search.length > 0) {
            for (const filter of normalizedParams.search) {
                if (filter.name === 'requested_at' && filter.value) {
                    const condition = (filter.condition ?? '').toUpperCase();

                    if (['GREATER', 'GREATEROREQUAL'].includes(condition)) {
                    lowerBound = filter.value;
                    }

                    if (['LESSER', 'LESSEROREQUAL'].includes(condition)) {
                    upperBound = filter.value;
                    }
                }
            }
        }

        if (lowerBound) {
            whereConditions.push(sql`repair_request.requested_at >= ${lowerBound}`);
        }

        if (upperBound) {
            whereConditions.push(sql`repair_request.requested_at <= ${upperBound}`);
        }

        if (normalizedParams.search && normalizedParams.search.length > 0) {
            const otherFilters = normalizedParams.search.filter(f => f.name !== 'requested_at');
            if (otherFilters.length > 0) {
                const filterSQL = QueryBuilder.BuildRawSQLFilterExpression(otherFilters);
            if (filterSQL) whereConditions.push(filterSQL);
            }
        }

        if (normalizedParams.searchTerm) {
            const searchSQL = QueryBuilder.BuildRawSQLSearchExpression(normalizedParams.searchTerm);
            if (searchSQL) whereConditions.push(searchSQL);
        }

        const whereClause = sql`
            WHERE ${sql.join(whereConditions, sql` AND `)}
        `;

        const innerQuery = sql`
            SELECT
                product.name AS product_name,
                CAST(COUNT(DISTINCT repair_request.id) AS INTEGER) AS value
            FROM ${repairRequestTable} repair_request
            INNER JOIN ${repairRequestItemTable} repair_request_item
                ON repair_request_item.repair_request_id = repair_request.id
            INNER JOIN ${productTable} product
                ON product.id = repair_request_item.product_id
            ${whereClause}
            GROUP BY product.name
        `;

        const query = sql`
            SELECT
                base.product_name AS "productName",
                base.value
            FROM (${innerQuery}) base
            ORDER BY base.value DESC, base.product_name ASC
        `;

        const result = await this._db.db.execute<TopRepairedProductsPerformanceReportRow>(query);

        return Array.from(result).map(row => ({
            productName: row.productName,
            value: row.value
        }));
    }

    public async GetMonthlyRepairTrendByProductTypeReport(startDate: Date, endDate: Date): Promise<MonthlyRepairTrendByProductTypeReport[]>
    {
        const query = sql`
            WITH ProductTypeStats AS (
                SELECT
                    product_type.id,
                    product_type.code,
                    product_type.name AS "productTypeName",
                    (
                        SELECT COUNT(repair_request_item.id)::int
                        FROM ${repairRequestItemTable} repair_request_item
                        INNER JOIN ${productTable} product ON product.id = repair_request_item.product_id
                        INNER JOIN ${repairRequestTable} repair_request ON repair_request.id = repair_request_item.repair_request_id
                        WHERE product.product_type_id = product_type.id
                          AND repair_request.deleted = false
                          AND repair_request.requested_at >= ${startDate.toISOString()}
                          AND repair_request.requested_at <= ${endDate.toISOString()}
                    ) AS value
                FROM ${productTypeTable} product_type
            )
            SELECT
                "productTypeName",
                SUM(value)::int AS value
            FROM ProductTypeStats
            GROUP BY "productTypeName"
            ORDER BY MAX(code) ASC
        `;

        const result = await this._db.db.execute<{ productTypeName: string, value: number }>(query);

        return Array.from(result).map(row => ({
            productTypeName: row.productTypeName,
            value: row.value
        }));
    }
}
