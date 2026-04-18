import { t } from "elysia";
import { PaginationSchema } from "./Core/PaginationSchema";
import { SearchSchema } from "./Core/SearchSchema";
import { OrderSchema } from "./Core/OrderSchema";

export const UserParameterSchema = t.Object({
    ...PaginationSchema,
    ...OrderSchema,
    ...SearchSchema,

    deleted: t.Optional(t.Boolean({ default: false })),
});

export const UserResponseSchema = t.Object({
    id: t.Number(),
    name: t.String(),
    email: t.String(),
    role: t.String(),
    departmentId: t.Nullable(t.Number()),
    departmentName: t.Nullable(t.String()),
    departmentCode: t.Nullable(t.String()),
    createdAt: t.Nullable(t.String()),
    updatedAt: t.Nullable(t.String()),
    createdBy: t.Nullable(t.String()),
    updatedBy: t.Nullable(t.String()),
});

export const UserForCreateSchema = t.Object({
    departmentId: t.Optional(t.Number()),
    email: t.String({ format: "email", maxLength: 150 }),
    password: t.String({ minLength: 6 }),
    name: t.Optional(t.String({ maxLength: 150 })),
    avatarUrl: t.Optional(t.String()),
    role: t.Union([
        t.Literal("admin"),
        t.Literal("manager"),
        t.Literal("employee"),
    ]),
});

export const UserForUpdateSchema = t.Object({
    departmentId: t.Optional(t.Number()),
    email: t.Optional(t.String({ format: "email", maxLength: 150 })),
    password: t.Optional(t.String({ minLength: 6 })),
    name: t.Optional(t.String({ maxLength: 150 })),
    avatarUrl: t.Optional(t.String()),
    role: t.Optional(
        t.Union([t.Literal("admin"), t.Literal("manager"), t.Literal("employee")]),
    ),
});

export const UserIdParamSchema = t.Object({
    id: t.String({ pattern: "^[0-9]+$" }),
});

export const DeleteCollectionSchema = t.Object({
    ids: t.Array(t.String({ pattern: "^[0-9]+$" }), { minItems: 1 }),
});
