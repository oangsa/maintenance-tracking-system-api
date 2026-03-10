import { t } from 'elysia';

export const SearchConditionSchema = t.Object({
    name: t.String({ description: 'The name of the search condition' }),
    condition: t.String({ description: 'The condition to apply to the search', examples: ["CONTAINS", "STARTWITH", "ENDWITH", "GREATER", "LESSER", "GREATEROREQUAL", "LESSEROREQUAL", "EQUAL", "NOTEQUAL", "ISNULL", "ISNOTNULL"] }),
    value:t.String({ description: 'The value to search for' }),
});

export const SearchSchema = {
    search: t.Optional(t.Array(SearchConditionSchema)),
    searchTerm: t.Optional(
      t.Object({
        name: t.String({ description: 'The name of the field(s) to search. Supports dot-notation for nested fields (e.g. "department.name") and comma-separated for multiple fields (e.g. "name,email")' }),
        value: t.String({ description: 'The value to search for' }),
      })
    ),
};
