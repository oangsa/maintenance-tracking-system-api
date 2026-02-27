import { DrizzleDB, AppDrizzleDB } from "./Drizzle";
import { Configuration } from "../Core/Configuration";
import * as schema from "./Drizzle/schema";

export type { AppDrizzleDB };
export { DrizzleDB };

let drizzleInstance: AppDrizzleDB | null = null;

export class DrizzleFactory
{
    static initialize(connectionString?: string): AppDrizzleDB
    {
        if (!drizzleInstance)
        {
            const connString = connectionString || Configuration.getConnectionString();
            drizzleInstance = new DrizzleDB(connString, schema) as AppDrizzleDB;
        }

        return drizzleInstance;
    }

    static getInstance(): AppDrizzleDB
    {
        if (!drizzleInstance)
        {
            throw new Error("Drizzle not initialized. Call DrizzleFactory.initialize() first.");
        }

        return drizzleInstance;
    }

    static async disconnect(): Promise<void>
    {
        if (drizzleInstance)
        {
            await drizzleInstance.disconnect();
            drizzleInstance = null;
        }
    }

    static isInitialized(): boolean
    {
        return drizzleInstance !== null;
    }
}
