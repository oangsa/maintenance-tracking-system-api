import { Search } from "../../../Domains/RequestFeatures/Core/Search";
import { SearchTerm } from "../../../Domains/RequestFeatures/Core/SearchTerm";
import { QueryBuilderBadRequestException } from "../../../Domains/Exceptions/QueryBuilderBadRequestException";
import { SQL, sql } from "drizzle-orm";

type WhereCondition = Record<string, unknown>;
type OrderByCondition = Record<string, unknown>;

export class QueryBuilder {
    /**
     * Builds raw SQL WHERE conditions from search filters
     * Returns SQL template for use with Drizzle's sql`` tag
     */
    static BuildRawSQLFilterExpression(searches: Search[]): SQL | null
    {
        if (!searches || searches.length === 0) return null;

        const conditions: SQL[] = [];

        for (const search of searches)
        {
            if (!search.name || !search.condition) continue;

            const fieldName = search.name.toLowerCase();
            const condition = this.buildRawSQLSingleCondition(search, fieldName);

            if (condition) {
                conditions.push(condition);
            }
        }

        return conditions.length > 0 ? sql`(${sql.join(conditions, sql` AND `)})` : null;
    }

    private static buildRawSQLSingleCondition(search: Search, fieldName: string): SQL | null
    {
        const condition = search.condition?.toUpperCase();
        const value = search.value;
        const field = sql.identifier(fieldName);

        switch (condition)
        {
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
    static BuildRawSQLSearchExpression(searchTerm: SearchTerm): SQL | null
    {
        if (!searchTerm.name|| !searchTerm.value) return null;

        const propertyNames = searchTerm.name.split(',').map(name => name.trim());
        const searchValue = searchTerm.value;

        const conditions: SQL[] = [];

        for (const propertyName of propertyNames)
        {
            if (!propertyName) continue;

            const fieldName = propertyName.toLowerCase();
            const field = sql.identifier(fieldName);

            conditions.push(sql`${field} ILIKE ${`%${searchValue}%`}`);
        }

        return conditions.length > 0 ? sql`(${sql.join(conditions, sql` OR `)})` : null;
    }

    /**
     * Builds raw SQL ORDER BY clause
     * Format: "field1 asc, field2 desc"
     */
    static BuildRawSQLOrderQuery(orderByQueryString?: string): SQL
    {
        if (!orderByQueryString || orderByQueryString.trim() === '')
        {
            return sql`ORDER BY id ASC`;
        }

        const orderParams = orderByQueryString.trim().split(',');
        const orderParts: SQL[] = [];

        for (const orderParam of orderParams)
        {
            if (!orderParam || orderParam.trim() === '') continue;

            const trimmed = orderParam.trim();
            const parts = trimmed.split(' ');

            if (parts.length === 0) continue;

            const fieldPath = parts[0].toLowerCase();
            const direction = parts.length > 1 &&
                (parts[1].toLowerCase() === 'desc' || parts[1].toLowerCase() === 'descending')
                ? 'DESC'
                : 'ASC';

            const field = sql.identifier(fieldPath);
            orderParts.push(sql`${field} ${sql.raw(direction)}`);
        }

        if (orderParts.length === 0) {
            return sql`ORDER BY id ASC`;
        }

        return sql`ORDER BY ${sql.join(orderParts, sql`, `)}`;
    }

    private static parseValue(value: string): string | number | boolean | Date
    {
        // Try to parse as number
        if (!isNaN(Number(value)) && value.trim() !== '')
        {
            return Number(value);
        }

        // Try to parse as date
        const dateValue = new Date(value);
        if (!isNaN(dateValue.getTime()))
        {
            return dateValue;
        }

        // Try to parse as boolean
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;

        // Return as string
        return value;
    }

    // ==================== LEGACY PRISMA METHODS (Kept for reference) ====================

    /**
     * Builds a Prisma where condition from search filters (LEGACY - for reference)
     * Supports: CONTAINS, STARTWITH, ENDWITH, GREATER, LESSER, GREATEROREQUAL, LESSEROREQUAL, EQUAL, NOTEQUAL, ISNULL, ISNOTNULL
     */
    static BuildFilterExpression(searches: Search[]): WhereCondition
    {
        const whereConditions: WhereCondition[] = [];

        if (!searches || searches.length === 0)
        {
            return {};
        }

        const specialConditions = ["ISNULL", "ISNOTNULL"];

        for (const search of searches)
        {
            if (!search.name || !search.condition)
            {
                continue;
            }

            if (specialConditions.includes(search.condition) || (!specialConditions.includes(search.condition) && !search.value))
            {
                search.value = search.value ?? "";
            }

            try
            {
                const fieldName = search.name.toLowerCase();
                const condition = this.buildSingleCondition(search, fieldName);

                if (condition)
                {
                    whereConditions.push(condition);
                }
            }
            catch (error)
            {
                throw new QueryBuilderBadRequestException(`Invalid filter on field: ${search.name}`);
            }
        }

        if (whereConditions.length === 0)
        {
            return {};
        }

        return { AND: whereConditions };
    }

    private static buildSingleCondition(search: Search, fieldName: string): WhereCondition | null
    {
        const condition = search.condition?.toUpperCase();
        const value = search.value;

        switch (condition)
        {
            case "CONTAINS":
                return { [fieldName]: { contains: value, mode: 'insensitive' } };
            case "STARTWITH":
                return { [fieldName]: { startsWith: value, mode: 'insensitive' } };
            case "ENDWITH":
                return { [fieldName]: { endsWith: value, mode: 'insensitive' } };
            case "GREATER":
                return { [fieldName]: { gt: this.parseValue(value!) } };
            case "LESSER":
                return { [fieldName]: { lt: this.parseValue(value!) } };
            case "GREATEROREQUAL":
                return { [fieldName]: { gte: this.parseValue(value!) } };
            case "LESSEROREQUAL":
                return { [fieldName]: { lte: this.parseValue(value!) } };
            case "EQUAL":
                return { [fieldName]: value };
            case "NOTEQUAL":
                return { [fieldName]: { not: value } };
            case "ISNULL":
                return { [fieldName]: null };
            case "ISNOTNULL":
                return { [fieldName]: { not: null } };
            default:
                return null;
        }
    }

    /**
     * Builds a Prisma where condition for searching (LEGACY)
     */
    static BuildSearchExpression(searchTerm: SearchTerm): WhereCondition
    {
        if (!searchTerm.name || !searchTerm.value)
        {
            return {};
        }

        const propertyNames = searchTerm.name.split(',').map(name => name.trim());
        const searchValue = searchTerm.value.toLowerCase();

        const orConditions: WhereCondition[] = [];

        for (const propertyName of propertyNames)
        {
            if (!propertyName) continue;

            const nestedCondition = this.buildNestedSearchCondition(
                propertyName.toLowerCase(),
                searchValue
            );

            if (nestedCondition)
            {
                orConditions.push(nestedCondition);
            }
        }

        if (orConditions.length === 0)
        {
            return {};
        }

        return { OR: orConditions };
    }

    private static buildNestedSearchCondition(propertyPath: string, searchValue: string): WhereCondition | null
    {
        const parts = propertyPath.split('.');

        if (parts.length === 1)
        {
            return {
                [parts[0]]: {
                    contains: searchValue,
                    mode: 'insensitive'
                }
            };
        }

        let condition: any = {
            contains: searchValue,
            mode: 'insensitive'
        };

        for (let i = parts.length - 1; i >= 0; i--)
        {
            condition = {
                [parts[i]]: condition
            };
        }

        return condition;
    }

    /**
     * Builds Prisma orderBy (LEGACY)
     */
    static BuildOrderQuery(orderByQueryString?: string): OrderByCondition[]
    {
        if (!orderByQueryString || orderByQueryString.trim() === '')
        {
            return [{ id: 'asc' }];
        }

        const orderParams = orderByQueryString.trim().split(',');
        const orderBy: OrderByCondition[] = [];

        for (const orderParam of orderParams)
        {
            if (!orderParam || orderParam.trim() === '')
            {
                continue;
            }

            const trimmed = orderParam.trim();
            const parts = trimmed.split(' ');

            if (parts.length === 0) continue;

            const fieldPath = parts[0];
            const direction = parts.length > 1 &&
                (parts[1].toLowerCase() === 'desc' || parts[1].toLowerCase() === 'descending')
                ? 'desc'
                : 'asc';

            const orderCondition = this.buildNestedOrderBy(fieldPath.toLowerCase(), direction);
            orderBy.push(orderCondition);
        }

        return orderBy.length > 0 ? orderBy : [{ id: 'asc' }];
    }

    private static buildNestedOrderBy(propertyPath: string, direction: 'asc' | 'desc'): OrderByCondition
    {
        const parts = propertyPath.split('.');

        if (parts.length === 1)
        {
            return { [parts[0]]: direction };
        }

        let orderCondition: any = direction;

        for (let i = parts.length - 1; i >= 0; i--)
        {
            orderCondition = {
                [parts[i]]: orderCondition
            };
        }

        return orderCondition;
    }
}
