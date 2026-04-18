import { t } from "elysia";
import { PaginationSchema } from "./Core/PaginationSchema";
import { SearchSchema } from "./Core/SearchSchema";
import { OrderSchema } from "./Core/OrderSchema";

export const RepairRequestParameterSchema = t.Object({
    ...PaginationSchema,
    ...OrderSchema,
    ...SearchSchema,
    deleted: t.Optional(t.Boolean({ default: false })),
});

export const RepairRequestItemResponseSchema = t.Object({
    id: t.Number(),
    repairRequestId: t.Number(),
    productId: t.Number(),
    productCode: t.String(),
    productName: t.String(),
    description: t.String(),
    quantity: t.Number(),
    repairStatusId: t.Nullable(t.Number()),
    repairStatusCode: t.Nullable(t.String()),
    repairStatusName: t.Nullable(t.String()),
    departmentId: t.Number(),
});

export const RepairRequestResponseSchema = t.Object({
    id: t.Number(),
    requestNo: t.String(),
    requesterId: t.Number(),
    requesterName: t.Nullable(t.String()),
    requesterEmail: t.String(),
    priority: t.Union([
        t.Literal("low"),
        t.Literal("medium"),
        t.Literal("high"),
        t.Literal("urgent"),
    ]),
    requestedAt: t.Nullable(t.String()),
    currentStatusId: t.Number(),
    currentStatusCode: t.String(),
    currentStatusName: t.String(),
    createdAt: t.Nullable(t.String()),
    updatedAt: t.Nullable(t.String()),
    createdBy: t.Nullable(t.String()),
    updatedBy: t.Nullable(t.String()),
    items: t.Array(RepairRequestItemResponseSchema),
});

export const RepairRequestItemForCreateSchema = t.Object({
    productId: t.Number(),
    description: t.String({ minLength: 1 }),
    quantity: t.Number({ minimum: 1 }),
    departmentId: t.Number(),
});

export const RepairRequestForCreateSchema = t.Object({
    priority: t.Union([
        t.Literal("low"),
        t.Literal("medium"),
        t.Literal("high"),
        t.Literal("urgent"),
    ]),
    currentStatusId: t.Number(),
    items: t.Array(RepairRequestItemForCreateSchema, { minItems: 1 }),
});

export const RepairRequestForUpdateSchema = t.Object({
    priority: t.Optional(t.Union([
        t.Literal("low"),
        t.Literal("medium"),
        t.Literal("high"),
        t.Literal("urgent"),
    ])),
    currentStatusId: t.Optional(t.Number()),
});

export const RepairRequestIdParamSchema = t.Object({
    id: t.String({ pattern: "^[0-9]+$" }),
});

export const DeleteRepairRequestCollectionSchema = t.Object({
    ids: t.Array(t.String({ pattern: "^[0-9]+$" }), { minItems: 1 }),
});

export const RepairRequestStatusLogResponseSchema = t.Object({
    id: t.Number(),
    repairRequestId: t.Number(),
    oldStatusId: t.Nullable(t.Number()),
    oldStatusCode: t.Nullable(t.String()),
    oldStatusName: t.Nullable(t.String()),
    newStatusId: t.Number(),
    newStatusCode: t.String(),
    newStatusName: t.String(),
    changedBy: t.Nullable(t.Number()),
    changedByName: t.Nullable(t.String()),
    changedByEmail: t.Nullable(t.String()),
    note: t.Nullable(t.String()),
    changedAt: t.Nullable(t.String()),
});
