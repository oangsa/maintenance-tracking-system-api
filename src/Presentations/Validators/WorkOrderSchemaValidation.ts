import { t } from "elysia";
import { PaginationSchema } from "./Core/PaginationSchema";
import { SearchSchema } from "./Core/SearchSchema";
import { OrderSchema } from "./Core/OrderSchema";

export const WorkOrderParameterSchema = t.Object({
    ...PaginationSchema,
    ...OrderSchema,
    ...SearchSchema,

    deleted: t.Optional(t.Boolean({ default: false })),
});

export const WorkOrderResponseSchema = t.Object({
    id: t.Number(),
    repairRequestItemId : t.Number(),
    scheduledStart: t.String(),
    scheduledEnd: t.String(),
    orderSequence: t.Number(),
    statusId: t.Nullable(t.Number()),
    createdAt: t.Nullable(t.String()),
    updatedAt: t.Nullable(t.String()),
    createdBy: t.Nullable(t.String()),
    updatedBy: t.Nullable(t.String()),
    repairRequestItemDescription: t.Optional(t.String()),
    repairRequestItemRepairStatusId: t.Nullable(t.Number()),
    repairRequestItemRepairStatusCode: t.Nullable(t.String()),
    repairRequestItemRepairStatusName: t.Nullable(t.String()),
    repairRequestItemProductName: t.Optional(t.String()),
    repairRequestRequestNo: t.Optional(t.String()),
});

export const WorkOrderForCreateSchema = t.Object({
    repairRequestItemId: t.Number(),
    scheduledStart: t.String(),
    scheduledEnd: t.String(),
    orderSequence: t.Number({ minimum: 0 }),
    isFinal: t.Optional(t.Boolean()),
});

export const WorkOrderForUpdateSchema = t.Object({
    repairRequestItemId: t.Optional(t.Number()),
    scheduledStart: t.Optional(t.String()),
    scheduledEnd: t.Optional(t.String()),
    orderSequence: t.Optional(t.Number({ minimum: 0 })),
    isFinal: t.Optional(t.Boolean()),
});

export const WorkOrderIdParamSchema = t.Object({
    id: t.String({ pattern: "^[0-9]+$" }),
});

export const DeleteCollectionSchema = t.Object({
    ids: t.Array(t.String({ pattern: "^[0-9]+$" }), { minItems: 1 }),
});
