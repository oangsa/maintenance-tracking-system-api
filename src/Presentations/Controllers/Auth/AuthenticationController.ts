import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { IServiceManager } from "../../../Applications/Services/Core/IServiceManager";
import { InvalidCredentialsException } from "../../../Domains/Exceptions/Auth/InvalidCredentialsException";
import { UserForLoginSchema } from "../../Validators/AuthSchemaValidation";
import { JwtPlugin } from "../../Plugins/JwtPlugin";

const REFRESH_COOKIE = "refresh_token";
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export class AuthenticationController
{
    private readonly _service: IServiceManager;

    constructor(service: IServiceManager)
    {
        this._service = service;
    }

    public RegisterRoutes(app: Elysia<any>): void
    {
        const { secret, expiresIn } = this._service.configurationManager.jwt;

        app.group("/authentication", (app) =>
            app
                .use(jwt({ name: "accessJwt", secret, exp: expiresIn }))
                .post(
                    "/login",
                    async ({ body, set, accessJwt, cookie, request }) =>
                    {
                        try
                        {
                            const userAgent = request.headers.get("user-agent") ?? undefined;
                            const ipAddress =
                                request.headers.get("x-forwarded-for") ??
                                request.headers.get("x-real-ip") ??
                                undefined;

                            const result = await this._service.authService.Login(
                                body.email,
                                body.password,
                                userAgent,
                                ipAddress,
                            );

                            const accessToken = await accessJwt.sign({
                                type: "access",
                                sub: String(result.user.id),
                                role: result.user.role,
                                tokenVersion: result.tokenVersion,
                            });

                            cookie[REFRESH_COOKIE].set({
                                value: `${result.refreshTokenId}.${result.rawRefreshToken}`,
                                httpOnly: true,
                                maxAge: REFRESH_COOKIE_MAX_AGE,
                                path: "/",
                                sameSite: "strict",
                            });

                            return { accessToken, user: result.user };
                        }
                        catch (error)
                        {
                            return this.handleError(error, set);
                        }
                    },
                    {
                        body: UserForLoginSchema,
                        detail: { summary: "Login user", tags: ["Authentications"] },
                    },
                )
                .post(
                    "/refresh",
                    async ({ set, accessJwt, cookie, request }) =>
                    {
                        try
                        {
                            const rawCookie = cookie[REFRESH_COOKIE]?.value as string | undefined;

                            if (!rawCookie)
                            {
                                set.status = 401;
                                return { statusCode: 401, message: "No refresh token", error: "Unauthorized" };
                            }

                            const { tokenId, rawToken } = this.parseRefreshCookie(rawCookie);

                            if (!tokenId)
                            {
                                set.status = 401;
                                return { statusCode: 401, message: "Invalid refresh token", error: "Unauthorized" };
                            }

                            const userAgent = request.headers.get("user-agent") ?? undefined;
                            const ipAddress = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? undefined;

                            const result = await this._service.authService.Refresh(tokenId, rawToken, userAgent, ipAddress);

                            const accessToken = await accessJwt.sign({
                                type: "access",
                                sub: String(result.userId),
                                role: result.role,
                                tokenVersion: result.tokenVersion,
                            });

                            cookie[REFRESH_COOKIE].set({
                                value: `${result.refreshTokenId}.${result.rawRefreshToken}`,
                                httpOnly: true,
                                maxAge: REFRESH_COOKIE_MAX_AGE,
                                path: "/",
                                sameSite: "strict",
                            });

                            return { accessToken };
                        }
                        catch (error)
                        {
                            return this.handleError(error, set);
                        }
                    },
                    { detail: { summary: "Refresh access token", tags: ["Authentications"] } },
                )
                .group("", (app) =>
                    app
                        .use(JwtPlugin(secret, this._service.authService))
                        .post(
                            "/logout",
                            async ({ cookie }) =>
                            {
                                const rawCookie = cookie[REFRESH_COOKIE]?.value as string | undefined;

                                if (rawCookie)
                                {
                                    const { tokenId } = this.parseRefreshCookie(rawCookie);
                                    if (tokenId) await this._service.authService.Logout(tokenId);
                                }

                                cookie[REFRESH_COOKIE].remove();

                                return { message: "Logged out successfully" };
                            },
                            { detail: { summary: "Logout current device", tags: ["Authentications"] } },
                        )
                        .post(
                            "/logout-all",
                            async ({ currentUser, cookie }) =>
                            {
                                const userId = currentUser!.userId;
                                await this._service.authService.LogoutAll(userId);
                                cookie[REFRESH_COOKIE].remove();
                                return { message: "Logged out from all devices" };
                            },
                            { detail: { summary: "Logout all devices", tags: ["Authentications"] } },
                        ),
                ),
        );
    }

    private parseRefreshCookie(value: string): { tokenId: number | null; rawToken: string }
    {
        const dotIndex = value.indexOf(".");
        if (dotIndex < 0) return { tokenId: null, rawToken: "" };

        const tokenId = parseInt(value.slice(0, dotIndex));
        const rawToken = value.slice(dotIndex + 1);

        return { tokenId: isNaN(tokenId) ? null : tokenId, rawToken };
    }

    private handleError(error: any, set: any)
    {
        if (error instanceof InvalidCredentialsException)
        {
            set.status = 401;

            return {
                statusCode: 401,
                message: error.message,
                error: "Unauthorized",
            };
        }

        set.status = 500;

        return {
            statusCode: 500,
            message: error.message || "An unexpected error occurred",
            error: "Internal Server Error",
            stack:
                process.env.NODE_ENV === "development"
                    ? error.stack
                    : undefined,
        };
    }
}
