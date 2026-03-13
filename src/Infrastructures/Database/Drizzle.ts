import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres, { Sql } from "postgres";
import * as schema from "./Drizzle/schema";

export class DrizzleDB<TSchema extends Record<string, unknown> = Record<string, unknown>>
{
    private sql: Sql;
    public db: PostgresJsDatabase<TSchema>;

    constructor(connectionString: string, schemaObj?: TSchema)
    {
        this.sql = postgres(connectionString, { prepare: false });

        this.db = schemaObj
            ? drizzle({ client: this.sql, schema: schemaObj })
            : (drizzle({ client: this.sql }) as PostgresJsDatabase<TSchema>);
    }

    async disconnect(): Promise<void>
    {
        await this.sql.end();
    }

    async testConnection(): Promise<boolean>
    {
        try
        {
            await this.sql`SELECT 1`;
            return true;
        }
        catch (error)
        {
            console.error("Database connection test failed:", error);
            return false;
        }
    }
}

export type AppDrizzleDB = DrizzleDB<typeof schema>;
