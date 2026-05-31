import { IInventoryMoveRepository } from "@/Domains/Repositories/IInventoryMoveRepository";
import { AppDrizzleDB } from "../../Database";
import { InventoryMove } from "@/Infrastructures/Entities/Features/InventoryMove/InventoryMove";
import { InventoryMoveItem } from "@/Infrastructures/Entities/Features/InventoryMove/InventoryMoveItem";
import { inventoryMove as inventoryMoveTable, inventoryMoveItem as inventoryMoveItemTable } from "@/Infrastructures/Database/Drizzle/schema";
import { sql, SQL } from "drizzle-orm";
import { PagedResult } from "@/Domains/RequestFeatures/Core/PageResult";
import { InventoryMoveParameter } from "@/Domains/RequestFeatures/InventoryMoveParameter";
import { createPagedResult } from "@/Shared/Utilities/RequestFeatures/CreatePageResult";
import { normalizeRequestParameters } from "@/Shared/Utilities/RequestFeatures/NormalizedRequestParameters";
import { QueryBuilder } from "../Extensions/QueryBuilder";

type InventoryMoveRow = {
    id: number;
    move_no: string;
    reason: string;
    move_date: string | null;
    remark: string | null;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
    deleted: boolean | null;
};

type InventoryMoveItemRow = {
    id: number;
    inventory_move_id: number;
    part_id: number;
    part_code: string;
    part_name: string;
    quantity_in: number;
    quantity_out: number;
    note: string | null;
    work_order_part_id: number | null;
    work_order_part_part_code: string | null;
    work_order_part_part_name: string | null;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
    deleted: boolean | null;
};

export class InventoryMoveRepository implements IInventoryMoveRepository {
    private readonly _db: AppDrizzleDB;
    private static readonly ReverseRemarkMarkerPrefix = "[SYSTEM_REVERSE_OF_INVENTORY_MOVE_ID:";
    private static readonly BangkokTimezoneOffset = "+07:00";

    constructor(db: AppDrizzleDB) {
        this._db = db;
    }

    private mapRowToInventoryMove(row: InventoryMoveRow): InventoryMove {
        return {
            id: row.id,
            moveNo: row.move_no,
            reason: row.reason as any,
            moveDate: row.move_date ?? "",
            remark: row.remark ?? "",
            createdAt: row.created_at ?? "",
            updatedAt: row.updated_at ?? "",
            createdBy: row.created_by ?? "",
            updatedBy: row.updated_by ?? "",
            deleted: row.deleted ?? false,
            inventoryMoveItems: [] 
        };
    }

    private mapRowToInventoryMoveItem(row: InventoryMoveItemRow): InventoryMoveItem {
        return {
            id: row.id,
            inventoryMoveId: row.inventory_move_id,
            partId: row.part_id,
            partCode: row.part_code,
            partName: row.part_name,
            quantityIn: row.quantity_in,
            quantityOut: row.quantity_out,
            note: row.note ?? "",
            workOrderPartId: row.work_order_part_id,
            workOrderPartPartCode: row.work_order_part_part_code,
            workOrderPartPartName: row.work_order_part_part_name,
            createdAt: row.created_at ?? "",
            updatedAt: row.updated_at ?? "",
            createdBy: row.created_by ?? "",
            updatedBy: row.updated_by ?? "",
            deleted: row.deleted ?? false,
            part: {} as any 
        };
    }

    private IsDateOnlyValue(value: string): boolean
    {
        return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
    }

    private GetBangkokStartOfDayTimestamp(dateOnlyValue: string): string
    {
        return `${dateOnlyValue}T00:00:00.000${InventoryMoveRepository.BangkokTimezoneOffset}`;
    }

    private GetBangkokEndOfDayTimestamp(dateOnlyValue: string): string
    {
        return `${dateOnlyValue}T23:59:59.999${InventoryMoveRepository.BangkokTimezoneOffset}`;
    }

    private BuildMoveDateCondition(condition: string, value?: string): SQL | null
    {
        const normalizedCondition = condition.toUpperCase();
        const rawValue = value?.trim() ?? "";

        if (normalizedCondition !== "ISNULL" && normalizedCondition !== "ISNOTNULL" && rawValue === "")
        {
            return null;
        }

        const isDateOnly = this.IsDateOnlyValue(rawValue);
        const startOfDayValue = isDateOnly ? this.GetBangkokStartOfDayTimestamp(rawValue) : rawValue;
        const endOfDayValue = isDateOnly ? this.GetBangkokEndOfDayTimestamp(rawValue) : rawValue;

        switch (normalizedCondition)
        {
            case "GREATER":
                return sql`move_date > ${isDateOnly ? endOfDayValue : rawValue}`;
            case "LESSER":
                return sql`move_date < ${isDateOnly ? startOfDayValue : rawValue}`;
            case "GREATEROREQUAL":
                return sql`move_date >= ${startOfDayValue}`;
            case "LESSEROREQUAL":
                return sql`move_date <= ${endOfDayValue}`;
            case "EQUAL":
                return isDateOnly
                    ? sql`(move_date >= ${startOfDayValue} AND move_date <= ${endOfDayValue})`
                    : sql`move_date = ${rawValue}`;
            case "NOTEQUAL":
                return isDateOnly
                    ? sql`(move_date < ${startOfDayValue} OR move_date > ${endOfDayValue})`
                    : sql`move_date != ${rawValue}`;
            case "ISNULL":
                return sql`move_date IS NULL`;
            case "ISNOTNULL":
                return sql`move_date IS NOT NULL`;
            default:
                return null;
        }
    }

    async CreateInventoryMove(inventoryMove: InventoryMove): Promise<InventoryMove> {
    return await this._db.db.transaction(async (tx) => {
        const headerResult = await tx.execute<InventoryMoveRow>(sql`
            INSERT INTO ${inventoryMoveTable} (move_no, reason, move_date, remark, created_by, updated_by, deleted)
            VALUES (${inventoryMove.moveNo}, ${inventoryMove.reason}, ${inventoryMove.moveDate || sql`CURRENT_TIMESTAMP`}, ${inventoryMove.remark}, ${inventoryMove.createdBy}, ${inventoryMove.updatedBy}, false)
            RETURNING *
        `);

        const insertedHeader = this.mapRowToInventoryMove(headerResult[0]!);

        if (inventoryMove.inventoryMoveItems && inventoryMove.inventoryMoveItems.length > 0) {
            for (const item of inventoryMove.inventoryMoveItems) {
                const itemResult = await tx.execute<InventoryMoveItemRow>(sql`
                    INSERT INTO ${inventoryMoveItemTable} (inventory_move_id, part_id, quantity_in, quantity_out, note, work_order_part_id, created_by, updated_by, deleted)
                    VALUES (${insertedHeader.id}, ${item.partId}, ${item.quantityIn}, ${item.quantityOut}, ${item.note}, ${item.workOrderPartId ?? null}, ${inventoryMove.createdBy}, ${inventoryMove.updatedBy}, false)
                    RETURNING *
                `);

                if (itemResult[0]) {
                    // keep this branch for INSERT result existence only; full response hydration happens below
                }
            }
        }

        const fullMoveResult = await tx.execute<InventoryMoveRow>(sql`
            SELECT * FROM ${inventoryMoveTable}
            WHERE id = ${insertedHeader.id}
            LIMIT 1
        `);

        const fullMove = this.mapRowToInventoryMove(fullMoveResult[0]!);
        const fullItemsResult = await tx.execute<InventoryMoveItemRow>(sql`
            SELECT
                inventory_move_item.id,
                inventory_move_item.inventory_move_id,
                inventory_move_item.part_id,
                inventory_move_item_part.code AS part_code,
                inventory_move_item_part.name AS part_name,
                inventory_move_item.quantity_in,
                inventory_move_item.quantity_out,
                inventory_move_item.note,
                inventory_move_item.work_order_part_id,
                work_order_part_part.code AS work_order_part_part_code,
                work_order_part_part.name AS work_order_part_part_name,
                inventory_move_item.created_at,
                inventory_move_item.updated_at,
                inventory_move_item.created_by,
                inventory_move_item.updated_by,
                inventory_move_item.deleted
            FROM ${inventoryMoveItemTable} inventory_move_item
            LEFT JOIN part inventory_move_item_part ON inventory_move_item.part_id = inventory_move_item_part.id
            LEFT JOIN work_order_part ON inventory_move_item.work_order_part_id = work_order_part.id
            LEFT JOIN part work_order_part_part ON work_order_part.part_id = work_order_part_part.id
            WHERE inventory_move_item.inventory_move_id = ${insertedHeader.id}
              AND inventory_move_item.deleted = false
        `);

        fullMove.inventoryMoveItems = Array.from(fullItemsResult).map((row) => this.mapRowToInventoryMoveItem(row));

        return fullMove; 
    });
}

    async GetInventoryMoveById(id: number): Promise<InventoryMove | null> {
        const moveResult = await this._db.db.execute<InventoryMoveRow>(sql`
            SELECT * FROM ${inventoryMoveTable} WHERE id = ${id} AND deleted = false LIMIT 1
        `);

        if (moveResult.length === 0 || !moveResult[0]) return null;

        const move = this.mapRowToInventoryMove(moveResult[0]);

        const itemsResult = await this._db.db.execute<InventoryMoveItemRow>(sql`
            SELECT
                inventory_move_item.id,
                inventory_move_item.inventory_move_id,
                inventory_move_item.part_id,
                inventory_move_item_part.code AS part_code,
                inventory_move_item_part.name AS part_name,
                inventory_move_item.quantity_in,
                inventory_move_item.quantity_out,
                inventory_move_item.note,
                inventory_move_item.work_order_part_id,
                work_order_part_part.code AS work_order_part_part_code,
                work_order_part_part.name AS work_order_part_part_name,
                inventory_move_item.created_at,
                inventory_move_item.updated_at,
                inventory_move_item.created_by,
                inventory_move_item.updated_by,
                inventory_move_item.deleted
            FROM ${inventoryMoveItemTable} inventory_move_item
            LEFT JOIN part inventory_move_item_part ON inventory_move_item.part_id = inventory_move_item_part.id
            LEFT JOIN work_order_part ON inventory_move_item.work_order_part_id = work_order_part.id
            LEFT JOIN part work_order_part_part ON work_order_part.part_id = work_order_part_part.id
            WHERE inventory_move_item.inventory_move_id = ${id}
              AND inventory_move_item.deleted = false
        `);

        move.inventoryMoveItems = Array.from(itemsResult).map(row => this.mapRowToInventoryMoveItem(row));

        return move;
    }

    async GetListInventoryMove(parameters: InventoryMoveParameter): Promise<PagedResult<InventoryMove>> {
        const params = normalizeRequestParameters(parameters);
        const offset = (params.pageNumber - 1) * params.pageSize;
        const limit = params.pageSize;

        const ITEM_PREFIX = "inventory_move_items_";

        const mainSearch = (params.search ?? []).filter(search => !search.name?.startsWith(ITEM_PREFIX));
        const itemSearch = (params.search ?? [])
            .filter(search => search.name?.startsWith(ITEM_PREFIX))
            .map(search => ({ ...search, name: `item_base.${search.name!.slice(ITEM_PREFIX.length)}` }));

        let mainSearchTerm = params.searchTerm;
        let itemSearchTermFields: string[] = [];

        if (params.searchTerm?.name)
        {
            const allFields = params.searchTerm.name.split(",").map(field => field.trim());
            const mainFields = allFields.filter(field => !field.startsWith(ITEM_PREFIX));
            const itemFields = allFields
                .filter(field => field.startsWith(ITEM_PREFIX))
                .map(field => `item_base.${field.slice(ITEM_PREFIX.length)}`);

            mainSearchTerm = mainFields.length > 0
                ? { name: mainFields.join(","), value: params.searchTerm.value }
                : undefined;
            itemSearchTermFields = itemFields;
        }

        const whereConditions: SQL[] = [sql`deleted = ${params.deleted ?? false}`];

        const moveDateSearch = mainSearch.filter((search) => search.name?.toLowerCase() === "move_date");
        const nonMoveDateMainSearch = mainSearch.filter((search) => search.name?.toLowerCase() !== "move_date");

        for (const search of moveDateSearch)
        {
            const condition = search.condition?.toUpperCase();

            if (!condition)
            {
                continue;
            }

            const moveDateCondition = this.BuildMoveDateCondition(condition, search.value);

            if (!moveDateCondition)
            {
                continue;
            }

            whereConditions.push(moveDateCondition);
        }

        if (nonMoveDateMainSearch.length > 0)
        {
            const filterSQL = QueryBuilder.BuildRawSQLFilterExpression(nonMoveDateMainSearch);
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
            const itemFilterSQL = QueryBuilder.BuildRawSQLFilterExpression(itemSearch);
            if (itemFilterSQL) itemConditions.push(itemFilterSQL);
        }

        if (itemSearchTermFields.length > 0)
        {
            const itemTermConditions = itemSearchTermFields.map(field =>
            {
                const parts = field.split(".");
                const fieldSQL = sql.join(parts.map(part => sql.identifier(part)), sql.raw("."));
                return sql`${fieldSQL} ILIKE ${`%${params.searchTerm!.value}%`}`;
            });
            itemConditions.push(sql`(${sql.join(itemTermConditions, sql` OR `)})`);
        }

        if (itemConditions.length > 0)
        {
            const itemWhereSQL = sql.join(itemConditions, sql` AND `);
            const itemSubquery = sql`
                SELECT
                    inventory_move_item.inventory_move_id,
                    inventory_move_item.part_id,
                    inventory_move_item.quantity_in,
                    inventory_move_item.quantity_out,
                    inventory_move_item.note,
                    inventory_move_item.work_order_part_id,
                    inventory_move_item_part.code AS part_code,
                    inventory_move_item_part.name AS part_name,
                    work_order_part_part.code AS work_order_part_part_code,
                    work_order_part_part.name AS work_order_part_part_name
                FROM ${inventoryMoveItemTable} inventory_move_item
                LEFT JOIN part inventory_move_item_part ON inventory_move_item.part_id = inventory_move_item_part.id
                LEFT JOIN work_order_part ON inventory_move_item.work_order_part_id = work_order_part.id
                LEFT JOIN part work_order_part_part ON work_order_part.part_id = work_order_part_part.id
                WHERE inventory_move_item.deleted = false
            `;

            whereConditions.push(sql`EXISTS (
                SELECT 1 FROM (${itemSubquery}) item_base
                WHERE item_base.inventory_move_id = base.id
                AND ${itemWhereSQL}
            )`);
        }

        const whereClause = sql`WHERE ${sql.join(whereConditions, sql` AND `)}`;
        const orderByClause = params.orderBy
            ? QueryBuilder.BuildRawSQLOrderQuery(params.orderBy)
            : sql`ORDER BY created_at DESC`;

        const innerQuery = sql`
            SELECT
                inventory_move.id,
                inventory_move.move_no,
                inventory_move.reason,
                inventory_move.move_date,
                inventory_move.remark,
                inventory_move.created_at,
                inventory_move.updated_at,
                inventory_move.created_by,
                inventory_move.updated_by,
                inventory_move.deleted
            FROM ${inventoryMoveTable} inventory_move
        `;

        const [results, countResult] = await Promise.all([
            this._db.db.execute<InventoryMoveRow>(sql`
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
        const inventoryMoves = Array.from(results).map(row => this.mapRowToInventoryMove(row));

        if (inventoryMoves.length > 0)
        {
            const moveIds = inventoryMoves.map(move => move.id);
            const allItemsResult = await this._db.db.execute<InventoryMoveItemRow>(sql`
                SELECT
                    inventory_move_item.id,
                    inventory_move_item.inventory_move_id,
                    inventory_move_item.part_id,
                    inventory_move_item_part.code AS part_code,
                    inventory_move_item_part.name AS part_name,
                    inventory_move_item.quantity_in,
                    inventory_move_item.quantity_out,
                    inventory_move_item.note,
                    inventory_move_item.work_order_part_id,
                    work_order_part_part.code AS work_order_part_part_code,
                    work_order_part_part.name AS work_order_part_part_name,
                    inventory_move_item.created_at,
                    inventory_move_item.updated_at,
                    inventory_move_item.created_by,
                    inventory_move_item.updated_by,
                    inventory_move_item.deleted
                FROM ${inventoryMoveItemTable} inventory_move_item
                LEFT JOIN part inventory_move_item_part ON inventory_move_item.part_id = inventory_move_item_part.id
                LEFT JOIN work_order_part ON inventory_move_item.work_order_part_id = work_order_part.id
                LEFT JOIN part work_order_part_part ON work_order_part.part_id = work_order_part_part.id
                WHERE inventory_move_item.inventory_move_id IN ${sql`(${sql.join(moveIds, sql`, `)})`}
                  AND inventory_move_item.deleted = false
            `);

            const allItems = Array.from(allItemsResult).map(row => this.mapRowToInventoryMoveItem(row));

            inventoryMoves.forEach(move =>
            {
                move.inventoryMoveItems = allItems.filter(item => item.inventoryMoveId === move.id);
            });
        }

        return createPagedResult(inventoryMoves, totalCount, params.pageNumber, params.pageSize);
    }

    async UpdateInventoryMove(inventoryMove: Partial<InventoryMove>): Promise<InventoryMove> {
        const moveDate = (inventoryMove.moveDate && inventoryMove.moveDate.trim() !== "") 
        ? inventoryMove.moveDate 
        : null;
        const result = await this._db.db.execute<InventoryMoveRow>(sql`
            UPDATE ${inventoryMoveTable}
            SET
                reason = COALESCE(${inventoryMove.reason}, reason),
                remark = COALESCE(${inventoryMove.remark}, remark),
                move_date = COALESCE(${moveDate}, move_date),
                updated_by = ${inventoryMove.updatedBy},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${inventoryMove.id}
            RETURNING *
        `);
        if (result.length === 0 || !result[0]) {
        throw new Error(`Inventory move with id ${inventoryMove.id} not found or deleted.`);
    }

        return this.mapRowToInventoryMove(result[0]!);
    }

    async DeleteInventoryMove(id: number): Promise<void> {
        await this._db.db.transaction(async (tx) => {
            await tx.execute(sql`
                UPDATE ${inventoryMoveTable} SET deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}
            `);
            await tx.execute(sql`
                UPDATE ${inventoryMoveItemTable} SET deleted = true, updated_at = CURRENT_TIMESTAMP WHERE inventory_move_id = ${id}
            `);
        });
    }

    async GetInventoryMoveByMoveNo(moveNo: string, includeDeleted: boolean = false): Promise<InventoryMove | null> {
        const deletedFilter = includeDeleted ? sql`` : sql`AND deleted = false`;
        const result = await this._db.db.execute<InventoryMoveRow>(sql`
            SELECT * FROM ${inventoryMoveTable} WHERE move_no = ${moveNo} ${deletedFilter} LIMIT 1
        `);
        if (result.length === 0 || !result[0]) return null;
        return this.mapRowToInventoryMove(result[0]);
    }

    async CheckIfWorkOrderPartExistsInMove(workOrderPartId: number): Promise<boolean> {
        const result = await this._db.db.execute<{ count: number }>(sql`
            SELECT COUNT(*)::int AS count 
            FROM ${inventoryMoveItemTable} 
            WHERE work_order_part_id = ${workOrderPartId} AND deleted = false
        `);
        return (result[0]?.count ?? 0) > 0;     
    }

    async CheckIfInventoryMoveAlreadyReversed(originalInventoryMoveId: number): Promise<boolean> {
        const marker = `${InventoryMoveRepository.ReverseRemarkMarkerPrefix}${originalInventoryMoveId}]`;

        const result = await this._db.db.execute<{ count: number }>(sql`
            SELECT COUNT(*)::int AS count
            FROM ${inventoryMoveTable} reversed_inventory_move
            WHERE reversed_inventory_move.remark LIKE ${`%${marker}%`}
               OR reversed_inventory_move.move_no LIKE (
                    SELECT CONCAT('REV-', original_inventory_move.move_no, '-%')
                    FROM ${inventoryMoveTable} original_inventory_move
                    WHERE original_inventory_move.id = ${originalInventoryMoveId}
                    LIMIT 1
               )
        `);

        return (result[0]?.count ?? 0) > 0;
    }
}
