import { IProductTypeRepository } from "@/Domains/Repositories/IProductTypeRepository";
import { AppDrizzleDB } from "../../Database";
import { ProductType } from "@/Infrastructures/Entities/Master/ProductType";
import { productType as productTypeTable, department as departmentTable } from "@/Infrastructures/Database/Drizzle/schema";
import { sql, SQL } from "drizzle-orm";
import { PagedResult } from "@/Domains/RequestFeatures/Core/PageResult";
import { ProductTypeParameter } from "@/Domains/RequestFeatures/ProductTypeParameter";
import { createPagedResult } from "@/Shared/Utilities/RequestFeatures/CreatePageResult";
import { normalizeRequestParameters } from "@/Shared/Utilities/RequestFeatures/NormalizedRequestParameters";
import { QueryBuilder } from "../Extensions/QueryBuilder";

type ProductTypeRow = {
    id: number;
    code: string;
    name: string;
    department_id: number;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
    deleted: boolean | null;
    department_name: string | null;
    department_code: string | null;
    department_created_at: string | null;
    department_updated_at: string | null;
    department_created_by: string | null;
    department_updated_by: string | null;
    department_deleted: boolean | null;
};

export class ProductTypeRepository implements IProductTypeRepository
{
    private readonly _db: AppDrizzleDB;

    constructor(db: AppDrizzleDB)
    {
        this._db = db;
    }

    private mapRowToProductType(row: ProductTypeRow): ProductType
    {
        return {
            id: row.id,
            code: row.code,
            name: row.name,
            departmentId: row.department_id,
            createdAt: row.created_at!,
            updatedAt: row.updated_at!,
            createdBy: row.created_by,
            updatedBy: row.updated_by,
            deleted: row.deleted!,
            department: row.department_id ? {
                id: row.department_id,
                code: row.department_code ?? '',
                name: row.department_name ?? '',
                createdAt: row.department_created_at ?? '',
                updatedAt: row.department_updated_at ?? '',
                createdBy: row.department_created_by,
                updatedBy: row.department_updated_by,
                deleted: row.department_deleted ?? false,
            } : undefined,
        };
    }

    async GetProductTypeById(id: number): Promise<ProductType | null>
    {
        const result = await this._db.db.execute<ProductTypeRow>(sql`
            SELECT
                product_type.id,
                product_type.code,
                product_type.name,
                product_type.department_id,
                product_type.created_at,
                product_type.updated_at,
                product_type.created_by,
                product_type.updated_by,
                product_type.deleted,
                department.name AS department_name,
                department.code AS department_code,
                department.created_at AS department_created_at,
                department.updated_at AS department_updated_at,
                department.created_by AS department_created_by,
                department.updated_by AS department_updated_by,
                department.deleted AS department_deleted
            FROM ${productTypeTable} product_type
            LEFT JOIN ${departmentTable} department ON product_type.department_id = department.id
            WHERE product_type.id = ${id}
        `);

        if (result.length === 0)
        {
            return null;
        }

        return this.mapRowToProductType(result[0] as ProductTypeRow);
    }

    async GetProductTypeByCode(code: string, includeDeleted: boolean = false): Promise<ProductType | null>
    {
        const deletedFilter = includeDeleted ? sql`` : sql`AND product_type.deleted = false`;

        const result = await this._db.db.execute<ProductTypeRow>(sql`
            SELECT
                product_type.id,
                product_type.code,
                product_type.name,
                product_type.department_id,
                product_type.created_at,
                product_type.updated_at,
                product_type.created_by,
                product_type.updated_by,
                product_type.deleted,
                department.name AS department_name,
                department.code AS department_code,
                department.created_at AS department_created_at,
                department.updated_at AS department_updated_at,
                department.created_by AS department_created_by,
                department.updated_by AS department_updated_by,
                department.deleted AS department_deleted
            FROM ${productTypeTable} product_type
            LEFT JOIN ${departmentTable} department ON product_type.department_id = department.id
            WHERE product_type.code = ${code}
              ${deletedFilter}
            LIMIT 1
        `);

        if (result.length === 0 || !result[0])
        {
            return null;
        }

        return this.mapRowToProductType(result[0]);
    }

    async GetListProductType(parameters: ProductTypeParameter): Promise<PagedResult<ProductType>>
    {
        const params = normalizeRequestParameters(parameters);
        const offset = (params.pageNumber - 1) * params.pageSize;
        const limit = params.pageSize;

        const whereConditions: SQL[] = [sql`deleted = false`];

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
                product_type.id,
                product_type.code,
                product_type.name,
                product_type.department_id,
                product_type.created_at,
                product_type.updated_at,
                product_type.created_by,
                product_type.updated_by,
                product_type.deleted,
                department.name AS department_name,
                department.code AS department_code,
                department.created_at AS department_created_at,
                department.updated_at AS department_updated_at,
                department.created_by AS department_created_by,
                department.updated_by AS department_updated_by,
                department.deleted AS department_deleted
            FROM ${productTypeTable} product_type
            LEFT JOIN ${departmentTable} department ON product_type.department_id = department.id
        `;

        const [productTypeResults, countResult] = await Promise.all([
            this._db.db.execute<ProductTypeRow>(sql`
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
        const items = Array.from(productTypeResults).map((row: ProductTypeRow) => this.mapRowToProductType(row));

        return createPagedResult(items, totalCount, params.pageNumber, params.pageSize);
    }

    async CreateProductType(productType: ProductType): Promise<ProductType>
    {
        const result = await this._db.db.execute<ProductTypeRow>(sql`
            INSERT INTO ${productTypeTable} (
                code,
                name,
                department_id,
                created_by,
                updated_by,
                deleted
            )
            VALUES (
                ${productType.code},
                ${productType.name},
                ${productType.departmentId},
                ${productType.createdBy},
                ${productType.updatedBy},
                ${productType.deleted}
            )
            RETURNING
                id,
                code,
                name,
                department_id,
                created_at,
                updated_at,
                created_by,
                updated_by,
                deleted
            `);

        const created = result[0]!;

        // Fetch the full object with department info
        return this.GetProductTypeById(created.id) as Promise<ProductType>;
    }

    async UpdateProductType(productType: Partial<ProductType>): Promise<ProductType>
    {
        const result = await this._db.db.execute<ProductTypeRow>(sql`
            UPDATE ${productTypeTable}
            SET
                code = COALESCE(${productType.code}, code),
                name = COALESCE(${productType.name}, name),
                department_id = COALESCE(${productType.departmentId}, department_id),
                updated_by = COALESCE(${productType.updatedBy}, updated_by),
                deleted = COALESCE(${productType.deleted}, deleted),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${productType.id}
            RETURNING id
        `);

        if (result.length === 0)
        {
            throw new Error("Failed to update product type");
        }

        return this.GetProductTypeById(result[0]!.id) as Promise<ProductType>;
    }

    async DeleteProductType(id: number): Promise<void>
    {
        await this._db.db.execute(sql`
            UPDATE ${productTypeTable}
            SET
                deleted = true,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
        `);
    }
}
