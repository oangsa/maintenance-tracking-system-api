import { relations } from "drizzle-orm/relations";
import { inventoryMove, inventoryMoveItem, part, productType, department, product, repairRequest, workOrder, repairStatus, users, repairRequestItem, workTask, repairRequestStatusLog, workOrderPart, userDepartment } from "./schema";

export const inventoryMoveItemRelations = relations(inventoryMoveItem, ({one}) => ({
	inventoryMove: one(inventoryMove, {
		fields: [inventoryMoveItem.inventoryMoveId],
		references: [inventoryMove.id]
	}),
	part: one(part, {
		fields: [inventoryMoveItem.partId],
		references: [part.id]
	}),
}));

export const inventoryMoveRelations = relations(inventoryMove, ({many}) => ({
	inventoryMoveItems: many(inventoryMoveItem),
}));

export const partRelations = relations(part, ({one, many}) => ({
	inventoryMoveItems: many(inventoryMoveItem),
	productType: one(productType, {
		fields: [part.productTypeId],
		references: [productType.id]
	}),
	workOrderParts: many(workOrderPart),
}));

export const productTypeRelations = relations(productType, ({one, many}) => ({
	parts: many(part),
	department: one(department, {
		fields: [productType.departmentId],
		references: [department.id]
	}),
	products: many(product),
}));

export const departmentRelations = relations(department, ({many}) => ({
	productTypes: many(productType),
	repairRequests: many(repairRequest),
	userDepartments: many(userDepartment),
}));

export const productRelations = relations(product, ({one, many}) => ({
	productType: one(productType, {
		fields: [product.productTypeId],
		references: [productType.id]
	}),
	repairRequestItems: many(repairRequestItem),
}));

export const workOrderRelations = relations(workOrder, ({one, many}) => ({
	repairRequest: one(repairRequest, {
		fields: [workOrder.repairRequestId],
		references: [repairRequest.id]
	}),
	repairStatus: one(repairStatus, {
		fields: [workOrder.statusId],
		references: [repairStatus.id]
	}),
	workTasks: many(workTask),
	workOrderParts: many(workOrderPart),
}));

export const repairRequestRelations = relations(repairRequest, ({one, many}) => ({
	workOrders: many(workOrder),
	repairStatus: one(repairStatus, {
		fields: [repairRequest.currentStatusId],
		references: [repairStatus.id]
	}),
	department: one(department, {
		fields: [repairRequest.departmentId],
		references: [department.id]
	}),
	user: one(users, {
		fields: [repairRequest.requesterId],
		references: [users.id]
	}),
	repairRequestItems: many(repairRequestItem),
	repairRequestStatusLogs: many(repairRequestStatusLog),
}));

export const repairStatusRelations = relations(repairStatus, ({many}) => ({
	workOrders: many(workOrder),
	repairRequests: many(repairRequest),
	repairRequestStatusLogs_newStatusId: many(repairRequestStatusLog, {
		relationName: "repairRequestStatusLog_newStatusId_repairStatus_id"
	}),
	repairRequestStatusLogs_oldStatusId: many(repairRequestStatusLog, {
		relationName: "repairRequestStatusLog_oldStatusId_repairStatus_id"
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	repairRequests: many(repairRequest),
	repairRequestStatusLogs: many(repairRequestStatusLog),
	userDepartments: many(userDepartment),
}));

export const repairRequestItemRelations = relations(repairRequestItem, ({one}) => ({
	product: one(product, {
		fields: [repairRequestItem.productId],
		references: [product.id]
	}),
	repairRequest: one(repairRequest, {
		fields: [repairRequestItem.repairRequestId],
		references: [repairRequest.id]
	}),
}));

export const workTaskRelations = relations(workTask, ({one}) => ({
	workOrder: one(workOrder, {
		fields: [workTask.workOrderId],
		references: [workOrder.id]
	}),
}));

export const repairRequestStatusLogRelations = relations(repairRequestStatusLog, ({one}) => ({
	user: one(users, {
		fields: [repairRequestStatusLog.changedBy],
		references: [users.id]
	}),
	repairStatus_newStatusId: one(repairStatus, {
		fields: [repairRequestStatusLog.newStatusId],
		references: [repairStatus.id],
		relationName: "repairRequestStatusLog_newStatusId_repairStatus_id"
	}),
	repairStatus_oldStatusId: one(repairStatus, {
		fields: [repairRequestStatusLog.oldStatusId],
		references: [repairStatus.id],
		relationName: "repairRequestStatusLog_oldStatusId_repairStatus_id"
	}),
	repairRequest: one(repairRequest, {
		fields: [repairRequestStatusLog.repairRequestId],
		references: [repairRequest.id]
	}),
}));

export const workOrderPartRelations = relations(workOrderPart, ({one}) => ({
	part: one(part, {
		fields: [workOrderPart.partId],
		references: [part.id]
	}),
	workOrder: one(workOrder, {
		fields: [workOrderPart.workOrderId],
		references: [workOrder.id]
	}),
}));

export const userDepartmentRelations = relations(userDepartment, ({one}) => ({
	department: one(department, {
		fields: [userDepartment.departmentId],
		references: [department.id]
	}),
	user: one(users, {
		fields: [userDepartment.userId],
		references: [users.id]
	}),
}));