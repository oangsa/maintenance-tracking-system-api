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
    quantity_in: number;
    quantity_out: number;
    note: string | null;
    work_order_part_id: number | null;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
    deleted: boolean | null;
};

export class InventoryMoveRepository implements IInventoryMoveRepository {
    private readonly _db: AppDrizzleDB;

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
            quantityIn: row.quantity_in,
            quantityOut: row.quantity_out,
            note: row.note ?? "",
            workOrderPartId: row.work_order_part_id,
            createdAt: row.created_at ?? "",
            updatedAt: row.updated_at ?? "",
            createdBy: row.created_by ?? "",
            updatedBy: row.updated_by ?? "",
            deleted: row.deleted ?? false,
            part: {} as any 
        };
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
                    insertedHeader.inventoryMoveItems.push(this.mapRowToInventoryMoveItem(itemResult[0]));
                }
            }
        }

        return insertedHeader; 
    });
}

    async GetInventoryMoveById(id: number): Promise<InventoryMove | null> {
        const moveResult = await this._db.db.execute<InventoryMoveRow>(sql`
            SELECT * FROM ${inventoryMoveTable} WHERE id = ${id} AND deleted = false LIMIT 1
        `);

        if (moveResult.length === 0 || !moveResult[0]) return null;

        const move = this.mapRowToInventoryMove(moveResult[0]);

        const itemsResult = await this._db.db.execute<InventoryMoveItemRow>(sql`
            SELECT * FROM ${inventoryMoveItemTable} WHERE inventory_move_id = ${id} AND deleted = false
        `);

        move.inventoryMoveItems = Array.from(itemsResult).map(row => this.mapRowToInventoryMoveItem(row));

        return move;
    }

    async GetListInventoryMove(parameters: InventoryMoveParameter): Promise<PagedResult<InventoryMove>> {
    const params = normalizeRequestParameters(parameters);
    const offset = (params.pageNumber - 1) * params.pageSize;
    const limit = params.pageSize;

    // --- [TASK 03 MODIFIED]: เริ่มสร้างเงื่อนไข WHERE ---
    const whereConditions: SQL[] = [sql`deleted = ${params.deleted ?? false}`];

    // 1. [FIXED]: จัดการกับ params.search (Array) ที่เคยถูกมองข้าม
    if (params.search && params.search.length > 0) {
        params.search.forEach((filter) => {
            if (filter.name && filter.value) {
                // กรองเฉพาะฟิลด์ที่มีในตาราง inventory_move
                // ใช้ ILIKE สำหรับการค้นหาแบบไม่สนตัวพิมพ์เล็ก-ใหญ่ (Case-insensitive)
                whereConditions.push(sql.raw(`${filter.name}::text ILIKE '%${filter.value}%'`));
            }
        });
    }

    // 2. [FIXED]: จัดการกับ searchTerm เพื่อป้องกัน Error 500
    // เช็คว่าถ้าเป็น Object ให้ดึงค่า value ออกมาใช้
    if (params.searchTerm && typeof params.searchTerm === 'object') {
    const searchObj = params.searchTerm as any;
    if (searchObj.value) {
        whereConditions.push(sql.raw(`(move_no ILIKE '%${searchObj.value}%' OR remark ILIKE '%${searchObj.value}%')`));
    }
} else if (typeof params.searchTerm === 'string' && params.searchTerm !== "") {
    whereConditions.push(sql.raw(`(move_no ILIKE '%${params.searchTerm}%' OR remark ILIKE '%${params.searchTerm}%')`));
}

    const whereClause = sql`WHERE ${sql.join(whereConditions, sql` AND `)}`;
    const orderByClause = params.orderBy 
        ? QueryBuilder.BuildRawSQLOrderQuery(params.orderBy)
        : sql`ORDER BY created_at DESC`;

    // 3. [SUCCESS]: ดึงข้อมูล Header
    const [results, countResult] = await Promise.all([
        this._db.db.execute<InventoryMoveRow>(sql`
            SELECT * FROM ${inventoryMoveTable}
            ${whereClause}
            ${orderByClause}
            LIMIT ${limit} OFFSET ${offset}
        `),
        this._db.db.execute<{ count: number }>(sql`
            SELECT COUNT(*)::int AS count FROM ${inventoryMoveTable} ${whereClause}
        `),
    ]);

    const totalCount = countResult[0]?.count ?? 0;
    const inventoryMoves = Array.from(results).map(row => this.mapRowToInventoryMove(row));

    // --- [TASK 03 ADDED]: Data Hydration (ดึง Items มาแปะให้ครบตามโจทย์) ---
    if (inventoryMoves.length > 0) {
        const moveIds = inventoryMoves.map(m => m.id);
        const allItemsResult = await this._db.db.execute<InventoryMoveItemRow>(sql`
            SELECT * FROM ${inventoryMoveItemTable} 
            WHERE inventory_move_id IN ${sql`(${sql.join(moveIds, sql`, `)})`} 
            AND deleted = false
        `);

        const allItems = Array.from(allItemsResult).map(row => this.mapRowToInventoryMoveItem(row));

        // นำ Items ไปใส่ในแต่ละ Header ให้ถูกต้อง
        inventoryMoves.forEach(move => {
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
}