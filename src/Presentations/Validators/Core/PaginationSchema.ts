import { t } from 'elysia';

export const PaginationSchema = {
  pageNumber: t.Optional(t.Number({ minimum: 1, default: 1, description: 'The page number to retrieve' })),
  pageSize: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10, description: 'The number of items per page' })),
};
