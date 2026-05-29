import { t } from "elysia";
import { PaginationSchema } from "./Core/PaginationSchema";
import { SearchSchema } from "./Core/SearchSchema";
import { OrderSchema } from "./Core/OrderSchema";

export const ProductTypeParameterSchema = t.Object({
    ...PaginationSchema,
    ...OrderSchema,
    ...SearchSchema,

    deleted: t.Optional(t.Boolean({ default: false })),
});

export const ProductTypeResponseSchema = t.Object({
    id: t.Number(),
    code: t.String(),
    name: t.String(),
    departmentId: t.Number(),
    departmentCode: t.Nullable(t.String()),
    departmentName: t.Nullable(t.String()),
    createdAt: t.Nullable(t.String()),
    updatedAt: t.Nullable(t.String()),
    createdBy: t.Nullable(t.String()),
    updatedBy: t.Nullable(t.String()),
});

export const ProductTypeForCreateSchema = t.Object({
    code: t.String({ maxLength: 150 }),
    name: t.String({ maxLength: 150 }),
    departmentId: t.Number(),
});

export const ProductTypeForUpdateSchema = t.Object({
    code: t.Optional(t.String({ maxLength: 150 })),
    name: t.Optional(t.String({ maxLength: 150 })),
    departmentId: t.Optional(t.Number()),
});

export const ProductTypeIdParamSchema = t.Object({
    id: t.String({ pattern: "^[0-9]+$" }),
});

export const DeleteCollectionSchema = t.Object({
    ids: t.Array(t.String({ pattern: "^[0-9]+$" }), { minItems: 1 }),
});