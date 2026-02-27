import { ServiceManager } from "./ServiceManager";
import { CoreAdapterManager } from "../CoreAdaptorManager";
import { IServiceManager } from "../../Services/Core/IServiceManager";

let serviceManagerInstance: IServiceManager | null = null;

export class ServiceManagerFactory
{
    static initialize(): IServiceManager
    {
        if (!serviceManagerInstance)
        {
            const coreAdapterManager = new CoreAdapterManager();
            serviceManagerInstance = new ServiceManager(coreAdapterManager);
        }

        return serviceManagerInstance;
    }

    static getInstance(): IServiceManager
    {
        if (!serviceManagerInstance)
        {
            throw new Error("ServiceManager not initialized. Call ServiceManagerFactory.initialize() first.");
        }

        return serviceManagerInstance;
    }

    static isInitialized(): boolean
    {
        return serviceManagerInstance !== null;
    }
}
