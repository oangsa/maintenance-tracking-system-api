import { t } from "elysia";
import { PaginationSchema } from "./Core/PaginationSchema";
import { SearchSchema } from "./Core/SearchSchema";
import { OrderSchema } from "./Core/OrderSchema";

export const WorkTaskParameterSchema = t.Object({
    ...PaginationSchema,
    ...OrderSchema,
    ...SearchSchema,
    

});

export const WorkTaskResponseSchema = t.Object({
    id: t.Number(),
    workOrderId: t.Number(),
    description: t.String(),
    startedAt: t.Nullable(t.String()),
    endedAt: t.Nullable(t.String()),
    note: t.Nullable(t.String()),
    assigneeId: t.Nullable(t.Number()),
    assigneeName: t.Nullable(t.String()),
    assigneeEmail: t.Nullable(t.String()),
    assignedById: t.Nullable(t.Number()),
    assignedByName: t.Nullable(t.String()),
    createdAt: t.Nullable(t.String()),
    updatedAt: t.Nullable(t.String()),
    createdBy: t.Nullable(t.String()),
    updatedBy: t.Nullable(t.String()),
});

export const WorkTaskForCreateSchema = t.Object({
    workOrderId: t.Number(),
    description: t.String({ maxLength: 1000 }),
    startedAt: t.Nullable(t.String()),
    note: t.Nullable(t.String()),
    assigneeId: t.Optional(t.Number()),
});
   

export const WorkTaskForUpdateSchema = t.Object({
    description: t.Optional(t.String({ maxLength: 1000 })),
    startedAt: t.Optional(t.String()),
    endedAt: t.Optional(t.String()),
    note: t.Optional(t.String()),
});

export const WorkTaskIdParamSchema = t.Object({
    id: t.String({ pattern: "^[0-9]+$" }),
});

export const DeleteWorkTaskCollectionSchema = t.Object({
    ids: t.Array(t.String({ pattern: "^[0-9]+$" }), { minItems: 1 }),
});


export const WorkTaskAssignSchema = t.Object({
    assigneeId: t.Number(),

});

export const WorkTaskAssignResponseSchema = t.Object({
    id: t.Number(),
    workTaskId: t.Number(),
    assigneeId: t.Nullable(t.Number()),
    assigneeName: t.Nullable(t.String()),
    assigneeEmail: t.Nullable(t.String()),
    assignedById: t.Nullable(t.Number()),
    assignedByName: t.Nullable(t.String()),
    assignedAt: t.String(),
    unassignedAt: t.Nullable(t.String()),
});


export const WorkTaskUnassignSchema = t.Object({
    note: t.Optional(t.String()),
});

