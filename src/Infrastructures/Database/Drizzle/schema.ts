import { pgEnum, pgTable, serial, integer, varchar, text, timestamp, boolean, index, uniqueIndex, foreignKey, primaryKey, unique, check } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const repairPriority = pgEnum("repair_priority", ["low", "medium", "high", "urgent"])
export const rolesEnum = pgEnum("roles_enum", ["admin", "manager", "employee"])
export const inventoryMoveReason = pgEnum("inventory_move_reason", ["buy", "use", "lost", "found", "adjust"])


export const department = pgTable("department", {
	id: serial().primaryKey(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 150 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
	deleted: boolean().default(false),
}, (table) => [
	unique("department_code_key").on(table.code),]);

export const inventoryMove = pgTable("inventory_move", {
	id: serial().primaryKey(),
	moveNo: varchar("move_no", { length: 50 }).notNull(),
	reason: inventoryMoveReason().notNull(),
	moveDate: timestamp("move_date", { withTimezone: true }).default(sql`now()`),
	remark: text(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
	createdBy: varchar("created_by", { length: 50 }),
	updatedBy: varchar("updated_by", { length: 50 }),
	deleted: boolean().default(false),
}, (table) => [
	unique("inventory_move_move_no_key").on(table.moveNo),]);

export const inventoryMoveItem = pgTable("inventory_move_item", {
	id: serial().primaryKey(),
	inventoryMoveId: integer("inventory_move_id").notNull().references(() => inventoryMove.id),
	partId: integer("part_id").notNull().references(() => part.id),
	quantityIn: integer("quantity_in").default(0),
	quantityOut: integer("quantity_out").default(0),
	note: text(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
	createdBy: varchar("created_by", { length: 50 }),
	updatedBy: varchar("updated_by", { length: 50 }),
	deleted: boolean().default(false),
});

export const part = pgTable("part", {
	id: serial().primaryKey(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 150 }).notNull(),
	productTypeId: integer("product_type_id").notNull().references(() => productType.id),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
	deleted: boolean().default(false),
}, (table) => [
	unique("part_code_key").on(table.code),]);

export const product = pgTable("product", {
	id: serial().primaryKey(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 150 }).notNull(),
	productTypeId: integer("product_type_id").notNull().references(() => productType.id),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
	deleted: boolean().default(false),
}, (table) => [
	unique("product_code_key").on(table.code),]);

export const productType = pgTable("product_type", {
	id: serial().primaryKey(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 150 }).notNull(),
	departmentId: integer("department_id").notNull().references(() => department.id),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
	deleted: boolean().default(false),
}, (table) => [
	unique("product_type_code_key").on(table.code),]);

export const refreshToken = pgTable("refresh_token", {
	id: serial().primaryKey(),
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	tokenHash: text("token_hash").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	revoked: boolean().default(false).notNull(),
	userAgent: text("user_agent"),
	ipAddress: varchar("ip_address", { length: 100 }),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
}, (table) => [
	index("idx_refresh_token_expires_at").using("btree", table.expiresAt.asc().nullsLast()),
	index("idx_refresh_token_user_id").using("btree", table.userId.asc().nullsLast()),
]);

export const repairRequest = pgTable("repair_request", {
	id: serial().primaryKey(),
	requestNo: varchar("request_no", { length: 50 }).notNull(),
	requesterId: integer("requester_id").notNull().references(() => users.id),
	priority: repairPriority().notNull(),
	requestedAt: timestamp("requested_at", { withTimezone: true }).default(sql`now()`),
	currentStatusId: integer("current_status_id").notNull().references(() => repairStatus.id),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
	deleted: boolean().default(false),
}, (table) => [
	unique("repair_request_request_no_key").on(table.requestNo),]);

export const repairRequestItem = pgTable("repair_request_item", {
	id: serial().primaryKey(),
	repairRequestId: integer("repair_request_id").notNull().references(() => repairRequest.id),
	productId: integer("product_id").notNull().references(() => product.id),
	description: text().notNull(),
	quantity: integer().default(1).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
	repairStatusId: integer("repair_status_id").default(1).references(() => repairRequestItemStatus.id),
	departmentId: integer("department_id").notNull().references(() => department.id),
});

export const repairRequestItemStatus = pgTable("repair_request_item_status", {
	id: serial().primaryKey(),
	code: varchar().notNull(),
	name: varchar().notNull(),
	orderSequence: integer("order_sequence").notNull(),
	isFinal: boolean("is_final").default(false),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
	createdBy: varchar("created_by"),
	updatedBy: varchar("updated_by"),
	deleted: boolean().default(false),
}, (table) => [
	unique("repair_request_item_status_code_key").on(table.code),]);

export const repairRequestStatusLog = pgTable("repair_request_status_log", {
	id: serial().primaryKey(),
	repairRequestId: integer("repair_request_id").notNull().references(() => repairRequest.id),
	oldStatusId: integer("old_status_id").references(() => repairStatus.id),
	newStatusId: integer("new_status_id").notNull().references(() => repairStatus.id),
	changedBy: integer("changed_by").references(() => users.id),
	note: text(),
	changedAt: timestamp("changed_at", { withTimezone: true }).default(sql`now()`),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
});

export const repairStatus = pgTable("repair_status", {
	id: serial().primaryKey(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	orderSequence: integer("order_sequence").notNull(),
	isFinal: boolean("is_final").default(false),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
	deleted: boolean().default(false),
}, (table) => [
	unique("repair_status_code_key").on(table.code),]);

export const userDepartment = pgTable("user_department", {
	userId: integer("user_id").notNull().references(() => users.id),
	departmentId: integer("department_id").notNull().references(() => department.id),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
}, (table) => [
	primaryKey({ columns: [table.userId, table.departmentId], name: "user_department_pkey"}),
]);

export const users = pgTable("users", {
	id: serial().primaryKey(),
	email: varchar({ length: 150 }).notNull(),
	passwordHash: text("password_hash"),
	name: varchar({ length: 150 }),
	avatarUrl: text("avatar_url"),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
	deleted: boolean().default(false),
	role: rolesEnum().notNull(),
	tokenVersion: integer("token_version").default(0).notNull(),
}, (table) => [
	unique("users_email_key").on(table.email),]);

export const workOrder = pgTable("work_order", {
	id: serial().primaryKey(),
	scheduledStart: timestamp("scheduled_start", { withTimezone: true }),
	scheduledEnd: timestamp("scheduled_end", { withTimezone: true }),
	orderSequence: integer("order_sequence").notNull(),
	isFinal: boolean("is_final").default(false),
	statusId: integer("status_id").notNull().references(() => repairStatus.id),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
	repairRequestItemId: integer("repair_request_item_id").notNull().references(() => repairRequestItem.id),
});

export const workOrderPart = pgTable("work_order_part", {
	id: serial().primaryKey(),
	workOrderId: integer("work_order_id").notNull().references(() => workOrder.id),
	partId: integer("part_id").notNull().references(() => part.id),
	quantity: integer().notNull(),
	note: text(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
	inventoryMoveItemId: integer("inventory_move_item_id").references(() => inventoryMoveItem.id),
});

export const workTask = pgTable("work_task", {
	id: serial().primaryKey(),
	workOrderId: integer("work_order_id").notNull().references(() => workOrder.id),
	description: text().notNull(),
	startedAt: timestamp("started_at", { withTimezone: true }),
	endedAt: timestamp("ended_at", { withTimezone: true }),
	note: text(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
	createdBy: varchar("created_by", { length: 150 }),
	updatedBy: varchar("updated_by", { length: 150 }),
});

export const workTaskAssignment = pgTable.withRLS("work_task_assignment", {
	id: serial().primaryKey(),
	workTaskId: integer("work_task_id").notNull().references(() => workTask.id),
	assigneeId: integer("assignee_id").notNull().references(() => users.id),
	assignedBy: integer("assigned_by").notNull().references(() => users.id),
	assignedAt: timestamp("assigned_at", { withTimezone: true }).default(sql`now()`),
	unassignedAt: timestamp("unassigned_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
	createdBy: varchar("created_by"),
	updatedBy: varchar("updated_by"),
}, (table) => [
	uniqueIndex("ux_wta_one_active_per_task").using("btree", table.workTaskId.asc().nullsLast()).where(sql`(unassigned_at IS NULL)`),
check("chk_wta_time_valid", sql`((unassigned_at IS NULL) OR (unassigned_at >= assigned_at))`),]);
