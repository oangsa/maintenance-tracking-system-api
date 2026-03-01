import { pgTable, unique, serial, varchar, timestamp, text, boolean, foreignKey, integer, index, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const inventoryMoveReason = pgEnum("inventory_move_reason", ['buy', 'use', 'lost', 'found', 'adjust'])
export const repairPriority = pgEnum("repair_priority", ['low', 'medium', 'high', 'urgent'])
export const rolesEnum = pgEnum("roles_enum", ['admin', 'manager', 'employee'])


export const inventoryMove = pgTable("inventory_move", {
	id: serial().primaryKey().notNull(),
	moveNo: varchar("move_no", { length: 50 }).notNull(),
	reason: inventoryMoveReason().notNull(),
	moveDate: timestamp("move_date", { withTimezone: true, mode: 'string' }).defaultNow(),
	remark: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdBy: varchar("created_by", { length: 50 }),
	updatedBy: varchar("updated_by", { length: 50 }),
	deleted: boolean().default(false),
}, (table) => [
	unique("inventory_move_move_no_key").on(table.moveNo),
]);

export const inventoryMoveItem = pgTable("inventory_move_item", {
	id: serial().primaryKey().notNull(),
	inventoryMoveId: integer("inventory_move_id").notNull(),
	partId: integer("part_id").notNull(),
	quantityIn: integer("quantity_in").default(0),
	quantityOut: integer("quantity_out").default(0),
	note: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdBy: varchar("created_by", { length: 50 }),
	updatedBy: varchar("updated_by", { length: 50 }),
	deleted: boolean().default(false),
}, (table) => [
	foreignKey({
			columns: [table.inventoryMoveId],
			foreignColumns: [inventoryMove.id],
			name: "inventory_move_item_inventory_move_id_fkey"
		}),
	foreignKey({
			columns: [table.partId],
			foreignColumns: [part.id],
			name: "inventory_move_item_part_id_fkey"
		}),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	email: varchar({ length: 150 }).notNull(),
	passwordHash: text("password_hash"),
	name: varchar({ length: 150 }),
	avatarUrl: text("avatar_url"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
	deleted: boolean().default(false),
	role: rolesEnum().notNull(),
	tokenVersion: integer("token_version").default(0).notNull(),
}, (table) => [
	unique("users_email_key").on(table.email),
]);

export const part = pgTable("part", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 150 }).notNull(),
	productTypeId: integer("product_type_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
	deleted: boolean().default(false),
}, (table) => [
	foreignKey({
			columns: [table.productTypeId],
			foreignColumns: [productType.id],
			name: "part_product_type_id_fkey"
		}),
	unique("part_code_key").on(table.code),
]);

export const refreshToken = pgTable("refresh_token", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	tokenHash: text("token_hash").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	revoked: boolean().default(false).notNull(),
	userAgent: text("user_agent"),
	ipAddress: varchar("ip_address", { length: 100 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_refresh_token_expires_at").using("btree", table.expiresAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_refresh_token_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "refresh_token_user_id_fkey"
		}).onDelete("cascade"),
]);

export const productType = pgTable("product_type", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 150 }).notNull(),
	departmentId: integer("department_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
	deleted: boolean().default(false),
}, (table) => [
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [department.id],
			name: "product_type_department_id_fkey"
		}),
	unique("product_type_code_key").on(table.code),
]);

export const department = pgTable("department", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 150 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
	deleted: boolean().default(false),
}, (table) => [
	unique("department_code_key").on(table.code),
]);

export const product = pgTable("product", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 150 }).notNull(),
	productTypeId: integer("product_type_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
	deleted: boolean().default(false),
}, (table) => [
	foreignKey({
			columns: [table.productTypeId],
			foreignColumns: [productType.id],
			name: "product_product_type_id_fkey"
		}),
	unique("product_code_key").on(table.code),
]);

export const workOrder = pgTable("work_order", {
	id: serial().primaryKey().notNull(),
	repairRequestId: integer("repair_request_id").notNull(),
	scheduledStart: timestamp("scheduled_start", { withTimezone: true, mode: 'string' }),
	scheduledEnd: timestamp("scheduled_end", { withTimezone: true, mode: 'string' }),
	orderSequence: integer("order_sequence").notNull(),
	isFinal: boolean("is_final").default(false),
	statusId: integer("status_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
}, (table) => [
	foreignKey({
			columns: [table.repairRequestId],
			foreignColumns: [repairRequest.id],
			name: "work_order_repair_request_id_fkey"
		}),
	foreignKey({
			columns: [table.statusId],
			foreignColumns: [repairStatus.id],
			name: "work_order_status_id_fkey"
		}),
	unique("work_order_repair_request_id_order_sequence_key").on(table.repairRequestId, table.orderSequence),
]);

export const repairStatus = pgTable("repair_status", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	orderSequence: integer("order_sequence").notNull(),
	isFinal: boolean("is_final").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
	deleted: boolean().default(false),
}, (table) => [
	unique("repair_status_code_key").on(table.code),
]);

export const repairRequest = pgTable("repair_request", {
	id: serial().primaryKey().notNull(),
	requestNo: varchar("request_no", { length: 50 }).notNull(),
	requesterId: integer("requester_id").notNull(),
	departmentId: integer("department_id").notNull(),
	priority: repairPriority().notNull(),
	requestedAt: timestamp("requested_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	currentStatusId: integer("current_status_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
	deleted: boolean().default(false),
}, (table) => [
	foreignKey({
			columns: [table.currentStatusId],
			foreignColumns: [repairStatus.id],
			name: "repair_request_current_status_id_fkey"
		}),
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [department.id],
			name: "repair_request_department_id_fkey"
		}),
	foreignKey({
			columns: [table.requesterId],
			foreignColumns: [users.id],
			name: "repair_request_requester_id_fkey"
		}),
	unique("repair_request_request_no_key").on(table.requestNo),
]);

export const repairRequestItem = pgTable("repair_request_item", {
	id: serial().primaryKey().notNull(),
	repairRequestId: integer("repair_request_id").notNull(),
	productId: integer("product_id").notNull(),
	description: text().notNull(),
	quantity: integer().default(1).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [product.id],
			name: "repair_request_item_product_id_fkey"
		}),
	foreignKey({
			columns: [table.repairRequestId],
			foreignColumns: [repairRequest.id],
			name: "repair_request_item_repair_request_id_fkey"
		}),
]);

export const workTask = pgTable("work_task", {
	id: serial().primaryKey().notNull(),
	workOrderId: integer("work_order_id").notNull(),
	description: text().notNull(),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }),
	endedAt: timestamp("ended_at", { withTimezone: true, mode: 'string' }),
	note: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
}, (table) => [
	foreignKey({
			columns: [table.workOrderId],
			foreignColumns: [workOrder.id],
			name: "work_task_work_order_id_fkey"
		}),
]);

export const repairRequestStatusLog = pgTable("repair_request_status_log", {
	id: serial().primaryKey().notNull(),
	repairRequestId: integer("repair_request_id").notNull(),
	oldStatusId: integer("old_status_id"),
	newStatusId: integer("new_status_id").notNull(),
	changedBy: integer("changed_by"),
	note: text(),
	changedAt: timestamp("changed_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
}, (table) => [
	foreignKey({
			columns: [table.changedBy],
			foreignColumns: [users.id],
			name: "repair_request_status_log_changed_by_fkey"
		}),
	foreignKey({
			columns: [table.newStatusId],
			foreignColumns: [repairStatus.id],
			name: "repair_request_status_log_new_status_id_fkey"
		}),
	foreignKey({
			columns: [table.oldStatusId],
			foreignColumns: [repairStatus.id],
			name: "repair_request_status_log_old_status_id_fkey"
		}),
	foreignKey({
			columns: [table.repairRequestId],
			foreignColumns: [repairRequest.id],
			name: "repair_request_status_log_repair_request_id_fkey"
		}),
]);

export const workOrderPart = pgTable("work_order_part", {
	id: serial().primaryKey().notNull(),
	workOrderId: integer("work_order_id").notNull(),
	partId: integer("part_id").notNull(),
	quantity: integer().notNull(),
	note: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
}, (table) => [
	foreignKey({
			columns: [table.partId],
			foreignColumns: [part.id],
			name: "work_order_part_part_id_fkey"
		}),
	foreignKey({
			columns: [table.workOrderId],
			foreignColumns: [workOrder.id],
			name: "work_order_part_work_order_id_fkey"
		}),
]);

export const userDepartment = pgTable("user_department", {
	userId: integer("user_id").notNull(),
	departmentId: integer("department_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
}, (table) => [
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [department.id],
			name: "user_department_department_id_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_department_user_id_fkey"
		}),
	primaryKey({ columns: [table.userId, table.departmentId], name: "user_department_pkey"}),
]);
