import { RepairRequestForCreateSchema } from "@/Presentations/Validators/RepairRequestSchemaValidation";

export type RepairRequestForCreateDto = typeof RepairRequestForCreateSchema.static;