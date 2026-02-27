import { t } from 'elysia';
import { PaginationSchema } from './Core/PaginationSchema';
import { SearchSchema } from './Core/SearchSchema';
import { OrderSchema } from './Core/OrderSchema';

export const UserParameterSchema = t.Object({
  ...PaginationSchema,
  ...OrderSchema,
  ...SearchSchema,

  deleted: t.Optional(t.Boolean({ default: false })),
});

export const UserResponseSchema = t.Object({
  id: t.Number(),
  email: t.String(),
  role: t.String(),
  createdAt: t.Nullable(t.String()),
  updatedAt: t.Nullable(t.String()),
  createdByName: t.Nullable(t.String()),
  updatedByName: t.Nullable(t.String())
});

export const UserForCreateSchema = t.Object({
  email: t.String({ format: 'email', maxLength: 150 }),
  password: t.String({ minLength: 6 }),
  name: t.Optional(t.String({ maxLength: 150 })),
  avatarUrl: t.Optional(t.String()),
  role: t.String()
});

export const UserForUpdateSchema = t.Object({
  email: t.Optional(t.String({ format: 'email', maxLength: 150 })),
  password: t.Optional(t.String({ minLength: 6 })),
  name: t.Optional(t.String({ maxLength: 150 })),
  avatarUrl: t.Optional(t.String()),
  role: t.Optional(t.String())
});

export const UserIdParamSchema = t.Object({
    id: t.String({ pattern: '^[0-9]+$' })
});

export const DeleteCollectionSchema = t.Object({
    ids: t.Array(t.String({ pattern: '^[0-9]+$' }))
});
