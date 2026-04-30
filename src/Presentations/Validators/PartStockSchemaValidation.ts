import { t } from "elysia";

export const PartIdParamSchema = t.Object({
    id: t.String({ pattern: "^[0-9]+$" }),
});

export const ReceiveStockSchema = t.Object({
    quantity: t.Number({ minimum: 1 }),
    remark: t.Optional(t.String({ maxLength: 500 })),
    note: t.Optional(t.String({ maxLength: 500 })),
});

export const ConsumeStockSchema = t.Object({
    quantity: t.Number({ minimum: 1 }),
    workOrderPartId: t.Optional(t.Number()),
    remark: t.Optional(t.String({ maxLength: 500 })),
    note: t.Optional(t.String({ maxLength: 500 })),
});

export const AdjustStockSchema = t.Object({
    direction: t.Union([t.Literal("in"), t.Literal("out")]),
    quantity: t.Number(),
    reason: t.Optional(t.Union([t.Literal("adjust"), t.Literal("lost"), t.Literal("found")])),
    remark: t.Optional(t.String({ maxLength: 500 })),
    note: t.Optional(t.String({ maxLength: 500 })),
});



