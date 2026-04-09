import { RepairStatusResponseSchema } from "@/Presentations/Validators/RepairStatusSchemaValidation";

export type RepairStatusDto = typeof RepairStatusResponseSchema.static;