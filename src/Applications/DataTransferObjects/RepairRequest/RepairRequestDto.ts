import { RepairRequestResponseSchema } from "@/Presentations/Validators/RepairRequestSchemaValidation";

export type RepairRequestDto = typeof RepairRequestResponseSchema.static;