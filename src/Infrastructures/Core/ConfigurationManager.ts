import { DatabaseConnectionException } from "../../Domains/Exceptions/Database/DatabaseCustomException";
import { DatabaseConfiguration, JwtConfiguration, ServerConfiguration, IConfigurationManager } from "../../Applications/Services/Core/IConfigurationManager";

export class ConfigurationManager implements IConfigurationManager
{
    private readonly _database: DatabaseConfiguration;
    private readonly _jwt: JwtConfiguration;
    private readonly _server: ServerConfiguration;

    constructor()
    {
        this._database = this.LoadDatabaseConfiguration();
        this._jwt = this.LoadJWTConfiguration();
        this._server = this.LoadServerConfiguration();
    }

    get database(): DatabaseConfiguration
    {
        return this._database;
    }

    get jwt(): JwtConfiguration
    {
        return this._jwt;
    }

    get server(): ServerConfiguration
    {
        return this._server;
    }

    private LoadDatabaseConfiguration(): DatabaseConfiguration
    {
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString)
        {
            throw new DatabaseConnectionException(
                process.env.NODE_ENV === "production"
                    ? "Database connection string is not defined."
                    : "DATABASE_URL environment variable is not set."
            );
        }

        return { connectionString };
    }

    private LoadJWTConfiguration(): JwtConfiguration
    {
        const secret = process.env.JWT_SECRET;
        const expiresIn = process.env.JWT_EXPIRES_IN ?? "15m";
        const refreshExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d";

        if (!secret)
        {
            throw new Error(
                process.env.NODE_ENV === "production"
                    ? "JWT secret is not defined."
                    : "JWT_SECRET environment variable is not set."
            );
        }

        return { secret, expiresIn, refreshExpiresIn };
    }

    private LoadServerConfiguration(): ServerConfiguration
    {
        const raw = process.env.PORT;
        const port = raw !== undefined ? parseInt(raw, 10) : 3000;

        if (isNaN(port) || port < 1 || port > 65535)
        {
            throw new Error(
                `Invalid PORT value: "${raw}". Must be a valid integer between 1 and 65535.`
            );
        }

        return { port };
    }
}
