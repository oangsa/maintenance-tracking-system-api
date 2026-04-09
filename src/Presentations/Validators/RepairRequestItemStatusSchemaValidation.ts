import { t } from "elysia";
import { PaginationSchema } from "./Core/PaginationSchema";
import { SearchSchema } from "./Core/SearchSchema";
import { OrderSchema } from "./Core/OrderSchema";

export const RepairRequestItemStatusParameterSchema = t.Object({
    ...PaginationSchema,
    ...OrderSchema,
    ...SearchSchema,

    deleted: t.Optional(t.Boolean({ default: false })),
});

export const RepairRequestItemStatusResponseSchema = t.Object({
    id: t.Number(),
    code: t.String(),
    name: t.String(),
    orderSequence: t.Number(),
    isFinal: t.Boolean(),
    createdAt: t.Nullable(t.String()),
    updatedAt: t.Nullable(t.String()),
    createdBy: t.Nullable(t.String()),
    updatedBy: t.Nullable(t.String()),
});

export const RepairRequestItemStatusForCreateSchema = t.Object({
    code: t.String({ maxLength: 150 }),
    name: t.String({ maxLength: 150 }),
    orderSequence: t.Number({ minimum: 0 }),
    isFinal: t.Optional(t.Boolean()),
});

export const RepairRequestItemStatusForUpdateSchema = t.Object({
    code: t.Optional(t.String({ maxLength: 150 })),
    name: t.Optional(t.String({ maxLength: 150 })),
    orderSequence: t.Optional(t.Number({ minimum: 0 })),
    isFinal: t.Optional(t.Boolean()),
});

export const RepairRequestItemStatusIdParamSchema = t.Object({
    id: t.String({ pattern: "^[0-9]+$" }),
});

export const DeleteRepairRequestItemStatusCollectionSchema = t.Object({
    ids: t.Array(t.String({ pattern: "^[0-9]+$" }), { minItems: 1 }),
});
