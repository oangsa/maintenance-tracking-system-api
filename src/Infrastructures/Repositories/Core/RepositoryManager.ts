import { IRepositoryManager } from "../../../Domains/Repositories/Core/IRepositoryManager";
import { IUserRepository } from "../../../Domains/Repositories/IUserRepository";
import { UserRepository } from "../Master/UserRepository";
import { DrizzleFactory } from "../../Database";

export class RepositoryManager implements IRepositoryManager
{
    private readonly _userRepository: IUserRepository;

    constructor()
    {
        const drizzleDb = DrizzleFactory.getInstance();
        this._userRepository = new UserRepository(drizzleDb);
    }

    get userRepository(): IUserRepository {
        return this._userRepository;
    }
}
