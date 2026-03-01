import { DepartmentResponseSchema } from "../../../Presentations/Validators/DepartmentSchemaValidation"

export type DepartmentDto = typeof DepartmentResponseSchema.static
