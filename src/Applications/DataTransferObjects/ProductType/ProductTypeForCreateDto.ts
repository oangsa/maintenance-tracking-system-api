import { ProductTypeForCreateSchema } from "@/Presentations/Validators/ProductTypeSchemaValidation"

export type ProductTypeForCreateDto = typeof ProductTypeForCreateSchema.static
