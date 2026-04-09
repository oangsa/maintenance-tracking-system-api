import { t } from "elysia";
import { PaginationSchema } from "./Core/PaginationSchema";
import { SearchSchema } from "./Core/SearchSchema";
import { OrderSchema } from "./Core/OrderSchema";

export const RepairStatusParameterSchema = t.Object({
    ...PaginationSchema,
    ...OrderSchema,
    ...SearchSchema,

    deleted: t.Optional(t.Boolean({ default: false })),
});

export const RepairStatusResponseSchema = t.Object({
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

export const RepairStatusForCreateSchema = t.Object({
    code: t.String({ maxLength: 50 }),
    name: t.String({ maxLength: 150 }),
    orderSequence: t.Number({ default: 0 }),
    isFinal: t.Boolean({ default: false }),
});

export const RepairStatusForUpdateSchema = t.Object({
    code: t.Optional(t.String({ maxLength: 50 })),
    name: t.Optional(t.String({ maxLength: 150 })),
    orderSequence: t.Optional(t.Number()),
    isFinal: t.Optional(t.Boolean()),
});

export const RepairStatusIdParamSchema = t.Object({
    id: t.String({ pattern: "^[0-9]+$" }),
});