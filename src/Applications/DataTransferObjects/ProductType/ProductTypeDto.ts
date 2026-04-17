import { ProductTypeResponseSchema } from "@/Presentations/Validators/ProductTypeSchemaValidation"

export type ProductTypeDto = typeof ProductTypeResponseSchema.static
