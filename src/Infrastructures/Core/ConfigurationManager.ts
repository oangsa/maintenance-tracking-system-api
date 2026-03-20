import { DatabaseConnectionException } from "@/Domains/Exceptions/Database/DatabaseCustomException";
import { DatabaseConfiguration, JwtConfiguration, ServerConfiguration, IConfigurationManager } from "@/Applications/Services/Core/IConfigurationManager";

export class ConfigurationManager implements IConfigurationManager
{
    private readonly _database: DatabaseConfiguration;
    private readonly _jwt: JwtConfiguration;
    private readonly _server: ServerConfiguration;
    private readonly _winston: WinstonConfiguration;

    constructor()
    {
        this._database = this.LoadDatabaseConfiguration();
        this._jwt = this.LoadJWTConfiguration();
        this._server = this.LoadServerConfiguration();
        this._winston = this.LoadWinstonConfiguration();
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

    get winston(): WinstonConfiguration
    {
        return this._winston;
    }

    private LoadDatabaseConfiguration(): DatabaseConfiguration
    {
        const connectionString = process.env["DATABASE_URL"];

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
        const secret = process.env["JWT_SECRET"];
        const expiresIn = process.env['JWT_EXPIRES_IN'] ?? "15m";
        const refreshExpiresIn = process.env["REFRESH_TOKEN_EXPIRES_IN"] ?? "7d";

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
        const raw = process.env['PORT'];
        const port = raw !== undefined ? parseInt(raw, 10) : 3000;

        if (isNaN(port) || port < 1 || port > 65535)
        {
            throw new Error(
                `Invalid PORT value: "${raw}". Must be a valid integer between 1 and 65535.`
            );
        }

        return { port };
    }

    private LoadWinstonConfiguration(): WinstonConfiguration
    {
        const isProduction = process.env.NODE_ENV === "production";
        const level = process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug");
        const service = process.env.SERVICE_NAME ?? "maintenance-tracking-system-api";

        const developmentFormat = combine(
            colorize(),
            timestamp(),
            errors({ stack: true }),
            printf(({ level, message, timestamp: ts, service, ...meta }) =>
            {
                const metadata = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
                const serviceName = typeof service === "string" ? `[${service}]` : "";
                return `${ts} ${level} ${serviceName} ${message}${metadata}`.trim();
            })
        );

        const productionFormat = combine(
            timestamp(),
            errors({ stack: true }),
            json()
        );

        return {
            options: {
                level,
                defaultMeta: { service },
                format: isProduction ? productionFormat : developmentFormat,
                transports: [
                    new winston.transports.Console({
                        handleExceptions: true,
                    }),
                ],
                exitOnError: false,
            },
        };
    }
}
