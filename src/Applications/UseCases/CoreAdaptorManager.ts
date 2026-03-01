import { IRepositoryManager } from "../../Domains/Repositories/Core/IRepositoryManager";
import { RepositoryManager } from "../../Infrastructures/Repositories/Core/RepositoryManager";
import { IConfigurationManager } from "../../Infrastructures/Core/ConfigurationManager";

export interface ICoreAdapterManager
{
    configurationManager: IConfigurationManager;
    repositoryManager: IRepositoryManager;
}

export class CoreAdapterManager implements ICoreAdapterManager
{
    private readonly _configurationManager: IConfigurationManager;
    private readonly _repositoryManager: IRepositoryManager;

    constructor(configurationManager: IConfigurationManager)
    {
        this._configurationManager = configurationManager;
        this._repositoryManager = new RepositoryManager();
    }

    get configurationManager(): IConfigurationManager
    {
        return this._configurationManager;
    }

    get repositoryManager(): IRepositoryManager
    {
        return this._repositoryManager;
    }
}
