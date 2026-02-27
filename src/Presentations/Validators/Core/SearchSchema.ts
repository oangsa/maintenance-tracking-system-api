import { t } from 'elysia';

export const SearchConditionSchema = t.Object({
  alias: t.Optional(t.String({ description: 'The alias of the search condition' })),
  name: t.String({ description: 'The name of the search condition' }),
  condition: t.String({ description: 'The condition to apply to the search', examples: ["CONTAINS", "STARTS_WITH", "ENDS_WITH", "EQUALS", "NOT_EQUALS"] }),
  value: t.String({ description: 'The value to search for' }),
});

export const SearchSchema = {
  search: t.Optional(t.Array(SearchConditionSchema)),
  searchTerm: t.Optional(
    t.Object({
      alias: t.Optional(t.String({ description: 'The alias of the search term' })),
      name: t.String({ description: 'The name of the search term' }),
      value: t.String({ description: 'The value to search for' }),
    })
  ),
};
