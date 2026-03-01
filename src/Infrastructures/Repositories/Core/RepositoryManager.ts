import { IRepositoryManager } from "../../../Domains/Repositories/Core/IRepositoryManager";
import { IUserRepository } from "../../../Domains/Repositories/IUserRepository";
import { IRefreshTokenRepository } from "../../../Domains/Repositories/IRefreshTokenRepository";
import { UserRepository } from "../Master/UserRepository";
import { RefreshTokenRepository } from "../Auth/RefreshTokenRepository";
import { DrizzleFactory } from "../../Database";

export class RepositoryManager implements IRepositoryManager
{
    private readonly _userRepository: IUserRepository;
    private readonly _refreshTokenRepository: IRefreshTokenRepository;

    constructor()
    {
        const drizzleDb = DrizzleFactory.getInstance();
        this._userRepository = new UserRepository(drizzleDb);
        this._refreshTokenRepository = new RefreshTokenRepository(drizzleDb);
    }

    get userRepository(): IUserRepository {
        return this._userRepository;
    }

    get refreshTokenRepository(): IRefreshTokenRepository {
        return this._refreshTokenRepository;
    }
}
