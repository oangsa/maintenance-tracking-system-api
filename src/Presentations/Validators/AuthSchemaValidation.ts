import { t } from "elysia";

export const UserForLoginSchema = t.Object({
    email: t.String({ format: "email", maxLength: 150 }),
    password: t.String({ minLength: 6 }),
});

export const AuthUserSchema = t.Object({
    id: t.Number(),
    name: t.String(),
    email: t.String(),
    role: t.String(),
    departmentId: t.Nullable(t.Number()),
    departmentName: t.Nullable(t.String()),
    departmentCode: t.Nullable(t.String()),
    createdAt: t.Nullable(t.String()),
    updatedAt: t.Nullable(t.String()),
    createdBy: t.Nullable(t.String()),
    updatedBy: t.Nullable(t.String()),
});

export const LoginResponseSchema = t.Object({
    accessToken: t.String(),
    user: AuthUserSchema,
});

export const RefreshResponseSchema = t.Object({
    accessToken: t.String(),
});

export const MessageResponseSchema = t.Object({
    message: t.String(),
});
