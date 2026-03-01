import { t } from "elysia";

export const UserForLoginSchema = t.Object({
    email: t.String({ format: "email", maxLength: 150 }),
    password: t.String({ minLength: 6 }),
});
