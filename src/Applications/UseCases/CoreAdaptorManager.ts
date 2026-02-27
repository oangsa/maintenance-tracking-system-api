import { IRepositoryManager } from "../../Domains/Repositories/Core/IRepositoryManager";
import { RepositoryManager } from "../../Infrastructures/Repositories/Core/RepositoryManager";

export interface ICoreAdapterManager
{
    repositoryManager: IRepositoryManager;
}

export class CoreAdapterManager implements ICoreAdapterManager
{
    private readonly _repositoryManager: IRepositoryManager;

    constructor()
    {
        this._repositoryManager = new RepositoryManager();
    }

    get repositoryManager(): IRepositoryManager
    {
        return this._repositoryManager;
    }
}
