import Elysia from "elysia";
import { jwt } from "@elysiajs/jwt";
import { IAuthService } from "../../Applications/Services/IAuthService";
import { CurrentUserDto } from "../../Applications/DataTransferObjects/Auth/CurrentUserDto";

export const JwtPlugin = (secret: string, authService: IAuthService) =>
    new Elysia({ name: "jwt-guard" })
        .use(jwt({ name: "jwt", secret }))
        .derive({ as: "scoped" }, async ({ jwt, request }): Promise<{ currentUser: CurrentUserDto | null }> =>
        {
            const authorization = request.headers.get("authorization") ?? "";
            const token = authorization.startsWith("Bearer ")
                ? authorization.slice(7)
                : "";

            const payload = await jwt.verify(token);

            if (!payload || payload.type !== "access")
            {
                return { currentUser: null };
            }

            const userId = parseInt(payload.sub as string);
            const tokenVersion = payload.tokenVersion as number;

            const isValid = await authService.ValidateTokenVersion(userId, tokenVersion);

            if (!isValid)
            {
                return { currentUser: null };
            }

            return {
                currentUser: {
                    userId,
                    name: payload.name as (string | null),
                    role: payload.role as string,
                    tokenVersion,
                },
            };
        })
        .onBeforeHandle({ as: "scoped" }, ({ currentUser, set }) =>
        {
            if (!currentUser)
            {
                set.status = 401;

                return {
                    statusCode: 401,
                    message: "Unauthorized",
                    error: "Unauthorized",
                };
            }
        });
