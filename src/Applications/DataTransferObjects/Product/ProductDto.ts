import { ProductResponseSchema } from "@/Presentations/Validators/ProductSchemaValidation"

export type ProductDto = typeof ProductResponseSchema.static
