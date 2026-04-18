import { t } from "elysia";
import { InventoryMoveReason } from "@/Shared/Enums/InventoryMoveReason";
import { PaginationSchema } from "./Core/PaginationSchema";
import { SearchSchema } from "./Core/SearchSchema";
import { OrderSchema } from "./Core/OrderSchema";

export const InventoryMoveParameterSchema = t.Object({
    ...PaginationSchema,
    ...OrderSchema,
    ...SearchSchema,
    deleted: t.Optional(t.Boolean({ default: false })),
});

export const InventoryMoveItemResponseSchema = t.Object({
    id: t.Number(),
    inventoryMoveId: t.Number(),
    partId: t.Number(),
    quantityIn: t.Number(),
    quantityOut: t.Number(),
    note: t.Nullable(t.String()),
});

export const InventoryMoveResponseSchema = t.Object({
    id: t.Number(),
    moveNo: t.String(),
    reason: t.Enum(InventoryMoveReason),
    moveDate: t.String(),
    remark: t.String(),
    createdAt: t.Nullable(t.String()),
    updatedAt: t.Nullable(t.String()),
    createdBy: t.Nullable(t.String()),
    updatedBy: t.Nullable(t.String()),
    inventoryMoveItems: t.Array(InventoryMoveItemResponseSchema)
});

export const InventoryMoveForCreateSchema = t.Object({
    moveNo: t.Optional(t.String({ maxLength: 50 })),
    reason: t.Enum(InventoryMoveReason),
    moveDate: t.Optional(t.String()),
    remark: t.Optional(t.String({ maxLength: 500 })),
    inventoryMoveItems: t.Array(t.Object({
        partId: t.Number(),
        quantityIn: t.Number({ minimum: 0 }),
        quantityOut: t.Number({ minimum: 0 }),
        note: t.Optional(t.String())
    }), { minItems: 1 }) 
});

export const InventoryMoveForUpdateSchema = t.Object({
    reason: t.Optional(t.Enum(InventoryMoveReason)),
    moveDate: t.Optional(t.String()),
    remark: t.Optional(t.String({ maxLength: 500 })),
});

export const InventoryMoveIdParamSchema = t.Object({
    id: t.String({ pattern: "^[0-9]+$" }),
});

export const DeleteInventoryMoveCollectionSchema = t.Object({
    ids: t.Array(t.String({ pattern: "^[0-9]+$" }), { minItems: 1 }),
});