import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	inventoryMove: {
		parts: r.many.part({
			from: r.inventoryMove.id.through(r.inventoryMoveItem.inventoryMoveId),
			to: r.part.id.through(r.inventoryMoveItem.partId)
		}),
	},
	part: {
		inventoryMoves: r.many.inventoryMove(),
		productType: r.one.productType({
			from: r.part.productTypeId,
			to: r.productType.id
		}),
		workOrders: r.many.workOrder({
			from: r.part.id.through(r.workOrderPart.partId),
			to: r.workOrder.id.through(r.workOrderPart.workOrderId)
		}),
	},
	productType: {
		parts: r.many.part(),
		products: r.many.product(),
		department: r.one.department({
			from: r.productType.departmentId,
			to: r.department.id
		}),
	},
	product: {
		productType: r.one.productType({
			from: r.product.productTypeId,
			to: r.productType.id
		}),
		repairRequestItems: r.many.repairRequestItem(),
	},
	department: {
		productTypes: r.many.productType(),
		repairRequestItems: r.many.repairRequestItem(),
		users: r.many.users({
			from: r.department.id.through(r.userDepartment.departmentId),
			to: r.users.id.through(r.userDepartment.userId)
		}),
	},
	refreshToken: {
		user: r.one.users({
			from: r.refreshToken.userId,
			to: r.users.id
		}),
	},
	users: {
		refreshTokens: r.many.refreshToken(),
		repairStatuses: r.many.repairStatus(),
		repairRequestStatusLogs: r.many.repairRequestStatusLog(),
		departments: r.many.department(),
	},
	repairStatus: {
		users: r.many.users({
			from: r.repairStatus.id.through(r.repairRequest.currentStatusId),
			to: r.users.id.through(r.repairRequest.requesterId)
		}),
		repairRequestStatusLogsNewStatusId: r.many.repairRequestStatusLog({
			alias: "repairRequestStatusLog_newStatusId_repairStatus_id"
		}),
		repairRequestStatusLogsOldStatusId: r.many.repairRequestStatusLog({
			alias: "repairRequestStatusLog_oldStatusId_repairStatus_id"
		}),
		repairRequests: r.many.repairRequest(),
	},
	repairRequestItem: {
		repairRequestItemStatus: r.one.repairRequestItemStatus({
			from: r.repairRequestItem.repairStatusId,
			to: r.repairRequestItemStatus.id
		}),
		department: r.one.department({
			from: r.repairRequestItem.departmentId,
			to: r.department.id
		}),
		product: r.one.product({
			from: r.repairRequestItem.productId,
			to: r.product.id
		}),
		repairRequest: r.one.repairRequest({
			from: r.repairRequestItem.repairRequestId,
			to: r.repairRequest.id
		}),
	},
	repairRequestItemStatus: {
		repairRequestItems: r.many.repairRequestItem(),
	},
	repairRequest: {
		repairRequestItems: r.many.repairRequestItem(),
		repairRequestStatusLogs: r.many.repairRequestStatusLog(),
		repairStatuses: r.many.repairStatus({
			from: r.repairRequest.id.through(r.workOrder.repairRequestId),
			to: r.repairStatus.id.through(r.workOrder.statusId)
		}),
	},
	repairRequestStatusLog: {
		user: r.one.users({
			from: r.repairRequestStatusLog.changedBy,
			to: r.users.id
		}),
		repairStatusNewStatusId: r.one.repairStatus({
			from: r.repairRequestStatusLog.newStatusId,
			to: r.repairStatus.id,
			alias: "repairRequestStatusLog_newStatusId_repairStatus_id"
		}),
		repairStatusOldStatusId: r.one.repairStatus({
			from: r.repairRequestStatusLog.oldStatusId,
			to: r.repairStatus.id,
			alias: "repairRequestStatusLog_oldStatusId_repairStatus_id"
		}),
		repairRequest: r.one.repairRequest({
			from: r.repairRequestStatusLog.repairRequestId,
			to: r.repairRequest.id
		}),
	},
	workOrder: {
		parts: r.many.part(),
		workTasks: r.many.workTask(),
	},
	workTask: {
		workOrder: r.one.workOrder({
			from: r.workTask.workOrderId,
			to: r.workOrder.id
		}),
	},
}))