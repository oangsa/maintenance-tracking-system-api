import { t } from "elysia";
import { PaginationSchema } from "./Core/PaginationSchema";
import { SearchSchema } from "./Core/SearchSchema";
import { OrderSchema } from "./Core/OrderSchema";

export const WorkOrderPartParameterSchema = t.Object({
    ...PaginationSchema,
    ...OrderSchema,
    ...SearchSchema,
 
});

export const WorkOrderPartResponseSchema = t.Object({
    id: t.Number(),
    workOrderId: t.Number(),
    partId: t.Number(),
    partCode: t.Nullable(t.String()), 
    partName: t.Nullable(t.String()),
    quantity: t.Number(),
    note: t.Nullable(t.String()),
    createdAt: t.Nullable(t.String()),
    updatedAt: t.Nullable(t.String()),
    createdBy: t.Nullable(t.String()),
    updatedBy: t.Nullable(t.String()),
});

export const WorkOrderPartForCreateSchema = t.Object({
    workOrderId: t.Number(),
    partId: t.Number(),
    quantity: t.Number({ minimum: 1 }), 
    note: t.Optional(t.String()),
});

export const WorkOrderPartForUpdateSchema = t.Object({
    quantity: t.Optional(t.Number({ minimum: 1 })),
    note: t.Optional(t.String()),
});

export const WorkOrderPartIdParamSchema = t.Object({
    id: t.String({ pattern: "^[0-9]+$" }),
});

export const DeleteCollectionSchema = t.Object({
    ids: t.Array(t.String({ pattern: "^[0-9]+$" }), { minItems: 1 }),
});