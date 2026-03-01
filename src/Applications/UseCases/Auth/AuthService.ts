import { IAuthService } from "../../Services/IAuthService";
import { ICoreAdapterManager } from "../CoreAdaptorManager";
import { IRepositoryManager } from "../../../Domains/Repositories/Core/IRepositoryManager";
import { IConfigurationManager } from "../../../Infrastructures/Core/ConfigurationManager";
import { IMapperManager } from "../../Mappers/Core/IMapperManager";
import { AuthDto } from "../../DataTransferObjects/Auth/AuthDto";
import { InvalidCredentialsException } from "../../../Domains/Exceptions/Auth/InvalidCredentialsException";
import { signToken } from "../../../Shared/Utilities/Authentication/JWTUtils";
import { verifyPassword } from "../../../Shared/Utilities/Authentication/PasswordUtils";

export class AuthService implements IAuthService
{
    private readonly _repositoryManager: IRepositoryManager;
    private readonly _configurationManager: IConfigurationManager;
    private readonly _mapperManager: IMapperManager;

    constructor(coreAdapterManager: ICoreAdapterManager, mapperManager: IMapperManager)
    {
        this._repositoryManager = coreAdapterManager.repositoryManager;
        this._configurationManager = coreAdapterManager.configurationManager;
        this._mapperManager = mapperManager;
    }

    async Login(email: string, password: string): Promise<AuthDto>
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

        const { secret, expiresIn } = this._configurationManager.jwt;

        const accessToken = await signToken(
            { sub: String(user.id), email: user.email, role: user.role },
            secret,
            { expiresIn },
        );

        return {
            accessToken,
            user: this._mapperManager.userMapper.toDto(user),
        };
    }
}
