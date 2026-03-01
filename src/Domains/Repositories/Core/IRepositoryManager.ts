import { IUserRepository } from "../IUserRepository";
import { IRefreshTokenRepository } from "../IRefreshTokenRepository";

export interface IRepositoryManager {
    userRepository: IUserRepository;
    refreshTokenRepository: IRefreshTokenRepository;
}
