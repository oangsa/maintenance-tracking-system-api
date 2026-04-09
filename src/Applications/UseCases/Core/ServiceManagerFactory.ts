import { ServiceManager } from "./ServiceManager";
import { CoreAdapterManager } from "../CoreAdapterManager";
import { IServiceManager } from "../../Services/Core/IServiceManager";
import { IConfigurationManager } from "../../../Applications/Services/Core/IConfigurationManager";
import { createWinstonLogger } from "../../../Infrastructures/Logger/WinstonLogger";
import { LoggerService } from "../../../Infrastructures/Logger/LoggerService";
import { ILoggerService } from "../../Services/ILoggerService";

let serviceManagerInstance: IServiceManager | null = null;

export class ServiceManagerFactory
{
    static initialize(configurationManager: IConfigurationManager, loggerService?: ILoggerService): IServiceManager
    {
        if (!serviceManagerInstance)
        {
            const logger = loggerService ?? new LoggerService(createWinstonLogger(configurationManager.winston.options));
            const coreAdapterManager = new CoreAdapterManager(configurationManager, logger);
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
