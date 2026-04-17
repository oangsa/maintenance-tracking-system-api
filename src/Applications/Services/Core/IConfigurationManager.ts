import type { LoggerOptions } from "winston";

export interface DatabaseConfiguration
{
    connectionString: string;
}

export interface JwtConfiguration
{
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
}

export interface ServerConfiguration
{
    port: number;
}

export interface WinstonConfiguration
{
    options: LoggerOptions;
}

export interface ApiConfiguration
{
    supportedVersions: string[];
    defaultVersion: string;
}

export interface IConfigurationManager
{
    database: DatabaseConfiguration;
    jwt: JwtConfiguration;
    server: ServerConfiguration;
    winston: WinstonConfiguration;
    api: ApiConfiguration;
}
