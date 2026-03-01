import { DatabaseConnectionException } from "../../Domains/Exceptions/Database/DatabaseCustomException";

interface DatabaseConfiguration
{
    connectionString: string;
}

interface JwtConfiguration
{
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
}

export interface IConfigurationManager
{
    database: DatabaseConfiguration;
    jwt: JwtConfiguration;
}

export class ConfigurationManager implements IConfigurationManager
{
    private readonly _database: DatabaseConfiguration;
    private readonly _jwt: JwtConfiguration;

    constructor()
    {
        this._database = this.LoadDatabaseConfiguration();
        this._jwt = this.LoadJWTConfiguration();
    }

    get database(): DatabaseConfiguration
    {
        return this._database;
    }

    get jwt(): JwtConfiguration
    {
        return this._jwt;
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
}
