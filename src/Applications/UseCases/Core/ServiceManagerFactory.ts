import { ServiceManager } from "./ServiceManager";
import { CoreAdapterManager } from "../CoreAdapterManager";
import { IServiceManager } from "../../Services/Core/IServiceManager";
import { IConfigurationManager } from "../../../Infrastructures/Core/ConfigurationManager";

let serviceManagerInstance: IServiceManager | null = null;

export class ServiceManagerFactory
{
    static initialize(configurationManager: IConfigurationManager): IServiceManager
    {
        if (!serviceManagerInstance)
        {
            const coreAdapterManager = new CoreAdapterManager(configurationManager);
            serviceManagerInstance = new ServiceManager(coreAdapterManager);
        }

        return serviceManagerInstance;
    }

    static getInstance(): IServiceManager
    {
        if (!serviceManagerInstance)
        {
            throw new Error("ServiceManager not initialized. Call ServiceManagerFactory.initialize() to initialized it.");
        }

        return serviceManagerInstance;
    }

    static isInitialized(): boolean
    {
        return serviceManagerInstance !== null;
    }
}
