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
    repairRequestId : t.Number(),
    scheduledStart: t.String(),
    scheduledEnd: t.String(),
    orderSequence: t.Number(),
    isFinal: t.Boolean(),
    statusId: t.Number(),
    createdAt: t.Nullable(t.String()),
    updatedAt: t.Nullable(t.String()),
    createdBy: t.Nullable(t.String()),
    updatedBy: t.Nullable(t.String()),
});

export const WorkOrderForCreateSchema = t.Object({
    repairRequestId: t.Number(),
    scheduledStart: t.String(),
    scheduledEnd: t.String(),
    orderSequence: t.Number({ minimum: 0 }),
    isFinal: t.Optional(t.Boolean()),
    statusId: t.Number(),
});

export const WorkOrderForUpdateSchema = t.Object({
    repairRequestId: t.Optional(t.Number()),
    scheduledEnd: t.Optional(t.String()),
    orderSequence: t.Optional(t.Number({ minimum: 0 })),
    isFinal: t.Optional(t.Boolean()),
    statusId: t.Optional(t.Number()),
});

export const WorkOrderIdParamSchema = t.Object({
    id: t.String({ pattern: "^[0-9]+$" }),
});

