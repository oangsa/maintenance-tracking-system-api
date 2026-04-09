import Elysia from "elysia";
import { ApiConfiguration } from "../../Applications/Services/Core/IConfigurationManager";

export const ApiVersionValidatorPlugin = (apiConfiguration: ApiConfiguration) =>
    new Elysia({ name: "api-version-validator" })
        .onRequest(({ request, set }) =>
        {
            const requestPath = new URL(request.url).pathname;
            const requestedVersion = ExtractVersionFromPath(requestPath);

            if (!requestedVersion)
            {
                return;
            }

            if (apiConfiguration.supportedVersions.includes(requestedVersion))
            {
                return;
            }

            set.status = 400;

            return {
                statusCode: 400,
                message: `Unsupported API version 'v${requestedVersion}'.`,
                error: "Bad Request",
                supportedVersions: apiConfiguration.supportedVersions.map((version) => `v${version}`),
            };
        });

function ExtractVersionFromPath(pathname: string): string | null
{
    const matchedVersion = /^\/api\/v([^\/]+)(?:\/|$)/i.exec(pathname);

    if (!matchedVersion?.[1])
    {
        return null;
    }

    return NormalizeApiVersion(matchedVersion[1]);
}

function NormalizeApiVersion(version: string): string
{
    const trimmedVersion = version.trim().toLowerCase();

    if (trimmedVersion.startsWith("v"))
    {
        return trimmedVersion.slice(1);
    }

    return trimmedVersion;
}
