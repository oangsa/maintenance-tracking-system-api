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

export interface IConfigurationManager
{
    database: DatabaseConfiguration;
    jwt: JwtConfiguration;
    server: ServerConfiguration;
}
