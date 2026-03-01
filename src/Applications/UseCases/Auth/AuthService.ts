import { IAuthService } from "../../Services/IAuthService";
import { LoginResultDto } from "../../DataTransferObjects/Auth/LoginResultDto";
import { RefreshResultDto } from "../../DataTransferObjects/Auth/RefreshResultDto";
import { ICoreAdapterManager } from "../CoreAdaptorManager";
import { IRepositoryManager } from "../../../Domains/Repositories/Core/IRepositoryManager";
import { IMapperManager } from "../../Mappers/Core/MapperManager";
import { InvalidCredentialsException } from "../../../Domains/Exceptions/Auth/InvalidCredentialsException";
import { verifyPassword } from "../../../Shared/Utilities/Authentication/PasswordUtils";

export class AuthService implements IAuthService
{
    private readonly _repositoryManager: IRepositoryManager;
    private readonly _mapperManager: IMapperManager;
    private readonly _refreshExpiryDays: number;

    constructor(coreAdapterManager: ICoreAdapterManager, mapperManager: IMapperManager)
    {
        this._repositoryManager = coreAdapterManager.repositoryManager;
        this._mapperManager = mapperManager;

        const refreshExpiresIn = coreAdapterManager.configurationManager.jwt.refreshExpiresIn;
        this._refreshExpiryDays = parseInt(refreshExpiresIn) || 7;
    }

    private getExpiresAt(): string
    {
        return new Date(Date.now() + this._refreshExpiryDays * 24 * 60 * 60 * 1000).toISOString();
    }

    async Login( email: string, password: string, userAgent?: string, ipAddress?: string,): Promise<LoginResultDto>
    {
        const user = await this._repositoryManager.userRepository.GetUserByEmail(email);

        if (!user || !user.passwordHash)
        {
            throw new InvalidCredentialsException();
        }

        const isPasswordValid = await verifyPassword(password, user.passwordHash);

        if (!isPasswordValid)
        {
            throw new InvalidCredentialsException();
        }

        const rawRefreshToken = crypto.randomUUID() + crypto.randomUUID();
        const tokenHash = await Bun.password.hash(rawRefreshToken);

        const record = await this._repositoryManager.refreshTokenRepository.Create({
            userId: user.id,
            tokenHash,
            expiresAt: this.getExpiresAt(),
            userAgent: userAgent ?? null,
            ipAddress: ipAddress ?? null,
        });

        return {
            refreshTokenId: record.id,
            rawRefreshToken,
            user: this._mapperManager.userMapper.UserToDto(user),
            tokenVersion: user.tokenVersion,
        };
    }

    async Refresh( tokenId: number, rawToken: string, userAgent?: string, ipAddress?: string,): Promise<RefreshResultDto>
    {
        const record = await this._repositoryManager.refreshTokenRepository.FindById(tokenId);

        if (!record)
        {
            throw new InvalidCredentialsException();
        }

        if (new Date(record.expiresAt) < new Date())
        {
            await this._repositoryManager.refreshTokenRepository.DeleteById(tokenId);
            throw new InvalidCredentialsException();
        }

        const isValid = await Bun.password.verify(rawToken, record.tokenHash);

        if (!isValid)
        {
            throw new InvalidCredentialsException();
        }

        const user = await this._repositoryManager.userRepository.GetUserById(record.userId);

        if (!user)
        {
            throw new InvalidCredentialsException();
        }

        await this._repositoryManager.refreshTokenRepository.DeleteById(tokenId);

        const newRawRefreshToken = crypto.randomUUID() + crypto.randomUUID();
        const newTokenHash = await Bun.password.hash(newRawRefreshToken);

        const newRecord = await this._repositoryManager.refreshTokenRepository.Create({
            userId: user.id,
            tokenHash: newTokenHash,
            expiresAt: this.getExpiresAt(),
            userAgent: userAgent ?? null,
            ipAddress: ipAddress ?? null,
        });

        return {
            refreshTokenId: newRecord.id,
            rawRefreshToken: newRawRefreshToken,
            userId: user.id,
            role: user.role,
            tokenVersion: user.tokenVersion,
        };
    }

    async Logout(tokenId: number): Promise<void>
    {
        const record = await this._repositoryManager.refreshTokenRepository.FindById(tokenId);

        await this._repositoryManager.refreshTokenRepository.DeleteById(tokenId);

        if (record)
        {
            await this._repositoryManager.userRepository.UpdateTokenVersion(record.userId);
        }
    }

    async LogoutAll(userId: number): Promise<void>
    {
        await this._repositoryManager.refreshTokenRepository.DeleteAllByUserId(userId);
        await this._repositoryManager.userRepository.UpdateTokenVersion(userId);
    }

    async ValidateTokenVersion(userId: number, tokenVersion: number): Promise<boolean>
    {
        const user = await this._repositoryManager.userRepository.GetUserById(userId);
        return user !== null && user.tokenVersion === tokenVersion;
    }
}
