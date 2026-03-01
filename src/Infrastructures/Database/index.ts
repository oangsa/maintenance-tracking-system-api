import { DrizzleDB, AppDrizzleDB } from "./Drizzle";
import { IConfigurationManager } from "../Core/ConfigurationManager";
import * as schema from "./Drizzle/schema";

export type { AppDrizzleDB };
export { DrizzleDB };

let drizzleInstance: AppDrizzleDB | null = null;

export class DrizzleFactory
{
    static initialize(configurationManager: IConfigurationManager): AppDrizzleDB
    {
        if (!drizzleInstance)
        {
            const connString = configurationManager.database.connectionString;
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
