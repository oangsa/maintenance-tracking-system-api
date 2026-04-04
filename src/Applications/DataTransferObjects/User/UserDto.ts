import { UserResponseSchema } from "@/Presentations/Validators/UserSchemaValidation"

export type UserDto = typeof UserResponseSchema.static
