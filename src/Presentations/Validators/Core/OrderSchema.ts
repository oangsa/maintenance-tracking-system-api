import { t } from 'elysia';

export const OrderSchema = {
  orderBy: t.Optional(t.String({ description: 'The field to order by' })),
};
