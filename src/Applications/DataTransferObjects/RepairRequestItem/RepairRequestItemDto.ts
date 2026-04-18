import { RepairRequestItemResponseSchema } from "@/Presentations/Validators/RepairRequestSchemaValidation";

export type RepairRequestItemDto = typeof RepairRequestItemResponseSchema.static;
