import { Search } from "@/Domains/RequestFeatures/Core/Search";
import { SearchTerm } from "@/Domains/RequestFeatures/Core/SearchTerm";
import { QueryBuilderBadRequestException } from "@/Domains/Exceptions/QueryBuilderBadRequestException";
import { SQL, sql } from "drizzle-orm";

export class QueryBuilder {
  /**
   * Builds raw SQL WHERE conditions from search filters
   * Returns SQL template for use with Drizzle's sql`` tag
   */
  static BuildRawSQLFilterExpression(searches: Search[]): SQL | null {
    if (!searches || searches.length === 0) return null;

    const conditions: SQL[] = [];

    for (const search of searches) {
      if (!search.name || !search.condition) continue;

      const fieldName = search.name.toLowerCase();
      const condition = this.buildRawSQLSingleCondition(search, fieldName);

      if (condition) {
        conditions.push(condition);
      }
    }

    return conditions.length > 0 ? sql`(${sql.join(conditions, sql` AND `)})` : null;
  }

  private static buildRawSQLSingleCondition(search: Search, fieldName: string): SQL | null {
    const condition = search.condition?.toUpperCase();
    const value = search.value;
    const field = this.buildIdentifier(fieldName);

    switch (condition) {
      case "CONTAINS":
        return sql`${field} ILIKE ${`%${value}%`}`;

      case "STARTWITH":
        return sql`${field} ILIKE ${`${value}%`}`;

      case "ENDWITH":
        return sql`${field} ILIKE ${`%${value}`}`;

      case "GREATER":
        return sql`${field} > ${this.parseValue(value!)}`;

      case "LESSER":
        return sql`${field} < ${this.parseValue(value!)}`;

      case "GREATEROREQUAL":
        return sql`${field} >= ${this.parseValue(value!)}`;

      case "LESSEROREQUAL":
        return sql`${field} <= ${this.parseValue(value!)}`;

      case "EQUAL":
        return sql`${field} = ${value}`;

      case "NOTEQUAL":
        return sql`${field} != ${value}`;

      case "ISNULL":
        return sql`${field} IS NULL`;

      case "ISNOTNULL":
        return sql`${field} IS NOT NULL`;

      default:
        throw new QueryBuilderBadRequestException(`Invalid condition: ${condition}`);
    }
  }

  /**
   * Builds raw SQL for searching across multiple fields
   * Returns SQL template with OR conditions
   */
  static BuildRawSQLSearchExpression(searchTerm: SearchTerm): SQL | null {
    if (!searchTerm.name || !searchTerm.value) return null;

    const propertyNames = searchTerm.name.split(',').map(name => name.trim());
    const searchValue = searchTerm.value;

    const conditions: SQL[] = [];

    for (const propertyName of propertyNames) {
      if (!propertyName) continue;

      const fieldName = propertyName.toLowerCase();
      const field = this.buildIdentifier(fieldName);

      conditions.push(sql`${field} ILIKE ${`%${searchValue}%`}`);
    }

    return conditions.length > 0 ? sql`(${sql.join(conditions, sql` OR `)})` : null;
  }

  /**
   * Builds raw SQL ORDER BY clause
   * Format: "field1 asc, field2 desc"
   */
  static BuildRawSQLOrderQuery(orderByQueryString?: string): SQL {
    if (!orderByQueryString || orderByQueryString.trim() === '') {
      return sql`ORDER BY id ASC`;
    }

    const orderParams = orderByQueryString.trim().split(',');
    const orderParts: SQL[] = [];

    for (const orderParam of orderParams) {
      if (!orderParam || orderParam.trim() === '') continue;

      const trimmed = orderParam.trim();
      const parts = trimmed.split(' ');

      if (parts.length === 0) continue;

      const fieldPath = parts[0]!.toLowerCase();
      const direction = parts.length > 1 &&
        (parts[1]!.toLowerCase() === 'desc' || parts[1]!.toLowerCase() === 'descending')
        ? 'DESC'
        : 'ASC';

      const field = this.buildIdentifier(fieldPath);
      orderParts.push(sql`${field} ${sql.raw(direction)}`);
    }

    if (orderParts.length === 0) {
      return sql`ORDER BY id ASC`;
    }

    return sql`ORDER BY ${sql.join(orderParts, sql`, `)}`;
  }

  /**
   * Builds a SQL identifier that supports dot-notation for qualified column references.
   *
   * A plain name like "email" produces:
   *   "email"
   *
   * A dot-notated name like "baseLocation.name" produces:
   *   "baselocation"."name"
   *
   * This allows callers to reference columns from JOINed tables, e.g.:
   *   searchTerm.name = "baseLocation.name,baseLocation.code,fromCurrency.code"
   *
   * Note: the repository query must already JOIN the referenced table under
   * the matching alias for the generated SQL to be valid.
   */
  private static buildIdentifier(fieldName: string): SQL {
    const parts = fieldName.split('.');

    if (parts.length === 1) {
      return sql`${sql.identifier(parts[0]!)}`;
    }

    return sql.join(parts.map(p => sql.identifier(p)), sql.raw('.'));
  }

  private static parseValue(value: string): string | number | boolean | Date {
    // Try to parse as number
    if (!isNaN(Number(value)) && value.trim() !== '') {
      return Number(value);
    }

    // Try to parse as date
    const dateValue = new Date(value);
    if (!isNaN(dateValue.getTime())) {
      return dateValue;
    }

    // Try to parse as boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    // Return as string
    return value;
  }
}
