import { IRepositoryManager } from "../../Domains/Repositories/Core/IRepositoryManager";
import { RepositoryManager } from "../../Infrastructures/Repositories/Core/RepositoryManager";
import { IConfigurationManager } from "../../Applications/Services/Core/IConfigurationManager";
import { ILoggerService } from "../Services/ILoggerService";

export interface ICoreAdapterManager
{
    configurationManager: IConfigurationManager;
    repositoryManager: IRepositoryManager;
    loggerService: ILoggerService;
}

export class CoreAdapterManager implements ICoreAdapterManager
{
    private readonly _configurationManager: IConfigurationManager;
    private readonly _repositoryManager: IRepositoryManager;
    private readonly _loggerService: ILoggerService;

    constructor(configurationManager: IConfigurationManager, loggerService: ILoggerService)
    {
        this._configurationManager = configurationManager;
        this._loggerService = loggerService;
        this._repositoryManager = new RepositoryManager(loggerService);
    }

    get configurationManager(): IConfigurationManager
    {
        return this._configurationManager;
    }

    get repositoryManager(): IRepositoryManager
    {
        return this._repositoryManager;
    }

    get loggerService(): ILoggerService
    {
        return this._loggerService;
    }
}
