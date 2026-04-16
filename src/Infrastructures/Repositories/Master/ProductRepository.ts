import { IProductRepository } from "../../../Domains/Repositories/IProductRepository";
import { AppDrizzleDB } from "../../Database";
import { Product } from "../../Entities/Master/Product";
import { product as productTable } from "../../Database/Drizzle/schema";
import { sql, SQL } from "drizzle-orm";
import { PagedResult } from "../../../Domains/RequestFeatures/Core/PageResult";
import { ProductParameter } from "../../../Domains/RequestFeatures/ProductParameter";
import { createPagedResult } from "../../../Shared/Utilities/RequestFeatures/CreatePageResult";
import { normalizeRequestParameters } from "../../../Shared/Utilities/RequestFeatures/NormalizedRequestParameters";
import { QueryBuilder } from "../Extensions/QueryBuilder";

type ProductRow = {
    id: number;
    code: string;
    name: string;
    product_type_id: number;
    product_type_code: string | null;
    product_type_name: string | null;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
    deleted: boolean | null;
};

export class ProductRepository implements IProductRepository
{
    private readonly _db: AppDrizzleDB;

    constructor(db: AppDrizzleDB)
    {
        this._db = db;
    }

    private mapRowToProduct(row: ProductRow): Product
    {
        return {
            id: row.id,
            code: row.code,
            name: row.name,
            productTypeId: row.product_type_id,
            productTypeCode: row.product_type_code ?? '',
            productTypeName: row.product_type_name ?? '',
            createdAt: row.created_at ?? '',
            updatedAt: row.updated_at ?? '',
            createdBy: row.created_by,
            updatedBy: row.updated_by,
            deleted: row.deleted ?? false,
        };
    }

    async GetProductById(id: number): Promise<Product | null>
    {
        const result = await this._db.db.execute<ProductRow>(sql`
            SELECT
                p.id,
                p.code,
                p.name,
                pt.id AS product_type_id,
                pt.code AS product_type_code,
                pt.name AS product_type_name,
                p.created_at,
                p.updated_at,
                p.created_by,
                p.updated_by,
                p.deleted
            FROM ${productTable} p
            JOIN product_type pt ON pt.id = p.product_type_id
            WHERE p.id = ${id} AND p.deleted = false
            LIMIT 1
        `);

        if (result.length === 0)
        {
            return null;
        }

        return this.mapRowToProduct(result[0]!);
    }

    async GetProductByCode(code: string, includeDeleted: boolean = false): Promise<Product | null>
    {
        const deletedFilter = includeDeleted ? sql`` : sql`AND p.deleted = false`;

        const result = await this._db.db.execute<ProductRow>(sql`
            SELECT
                p.id,
                p.code,
                p.name,
                pt.id AS product_type_id,
                pt.code AS product_type_code,
                pt.name AS product_type_name,
                p.created_at,
                p.updated_at,
                p.created_by,
                p.updated_by,
                p.deleted
            FROM ${productTable} p
            JOIN product_type pt ON pt.id = p.product_type_id
            WHERE p.code = ${code}
              ${deletedFilter}
            LIMIT 1
        `);

        if (result.length === 0)
        {
            return null;
        }

        return this.mapRowToProduct(result[0]!);
    }

    async GetListProduct(parameters: ProductParameter): Promise<PagedResult<Product>>
    {
        const params = normalizeRequestParameters(parameters);
        const offset = (params.pageNumber - 1) * params.pageSize;
        const limit = params.pageSize;

        const whereConditions: SQL[] = [sql`deleted = ${params.deleted ?? false}`];

        if (params.search && params.search.length > 0)
        {
            const filterSQL = QueryBuilder.BuildRawSQLFilterExpression(params.search);
            if (filterSQL) whereConditions.push(filterSQL);
        }

        if (params.searchTerm)
        {
            const searchSQL = QueryBuilder.BuildRawSQLSearchExpression(params.searchTerm);
            if (searchSQL) whereConditions.push(searchSQL);
        }

        const whereClause = sql`WHERE ${sql.join(whereConditions, sql` AND `)}`;
        const orderByClause = QueryBuilder.BuildRawSQLOrderQuery(params.orderBy);

        const innerQuery = sql`
            SELECT
                p.id,
                p.code,
                p.name,
                pt.id AS product_type_id,
                pt.code AS product_type_code,
                pt.name AS product_type_name,
                p.created_at,
                p.updated_at,
                p.created_by,
                p.updated_by,
                p.deleted
            FROM ${productTable} p
            JOIN product_type pt ON pt.id = p.product_type_id
        `;

        const [productResults, countResult] = await Promise.all([
            this._db.db.execute<ProductRow>(sql`
                SELECT * FROM (${innerQuery}) base
                ${whereClause}
                ${orderByClause}
                LIMIT ${limit}
                OFFSET ${offset}
            `),
            this._db.db.execute<{ count: number }>(sql`
                SELECT COUNT(*)::int AS count
                FROM (${innerQuery}) base
                ${whereClause}
            `),
        ]);

        const totalCount = countResult[0]?.count ?? 0;
        const items = Array.from(productResults).map((row: ProductRow) => this.mapRowToProduct(row));

        return createPagedResult(items, totalCount, params.pageNumber, params.pageSize);
    }

    async CreateProduct(product: Product): Promise<Product>
    {
        const result = await this._db.db.execute<ProductRow>(sql`
            INSERT INTO ${productTable} (
                code,
                name,
                product_type_id,
                created_by,
                updated_by,
                deleted
            )
            VALUES (
                ${product.code},
                ${product.name},
                ${product.productTypeId},
                ${product.createdBy},
                ${product.updatedBy},
                ${product.deleted}
            )
            RETURNING
                id,
                code,
                name,
                product_type_id,
                created_at,
                updated_at,
                created_by,
                updated_by,
                deleted
        `);

        const createdProduct = result[0]!;
        return this.GetProductById(createdProduct.id) as Promise<Product>;
    }

    async UpdateProduct(product: Partial<Product>): Promise<Product>
    {
        await this._db.db.execute(sql`
            UPDATE ${productTable}
            SET
                code = COALESCE(${product.code}, code),
                name = COALESCE(${product.name}, name),
                product_type_id = COALESCE(${product.productTypeId}, product_type_id),
                updated_by = COALESCE(${product.updatedBy}, updated_by),
                deleted = COALESCE(${product.deleted}, deleted),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${product.id}
        `);

        return this.GetProductById(product.id!) as Promise<Product>;
    }

    async DeleteProduct(id: number): Promise<void>
    {
        await this._db.db.execute(sql`
            UPDATE ${productTable}
            SET
                deleted = true,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
        `);
    }
}
