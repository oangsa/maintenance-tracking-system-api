import { Elysia } from "elysia";
import { IServiceManager } from "../../../Applications/Services/Core/IServiceManager";
import { InvalidCredentialsException } from "../../../Domains/Exceptions/Auth/InvalidCredentialsException";
import { UserForLoginSchema } from "../../Validators/AuthSchemaValidation";

export class AuthenticationController
{
    private readonly _service: IServiceManager;

    constructor(service: IServiceManager)
    {
        this._service = service;
    }

    public RegisterRoutes( app: Elysia<any>): void
    {
        app.group("/authentication", (app) =>
            app
                .post(
                    "/login",
                    async ({ body, set }) =>
                    {
                        try
                        {
                            return await this._service.authService.Login(body.email, body.password);
                        }
                        catch (error)
                        {
                            return this.handleError(error, set);
                        }
                    },
                    {
                        body: UserForLoginSchema,
                        detail: { summary: "login user", tags: ["authentication"] },
                    },
                )
                .get(
                    "/logout",
                    async () =>
                    {
                    },
                    {
                        detail: { summary: "logout user", tags: ["authentication"] },
                    },
                )
            );
    }

    private handleError(error: any, set: any)
    {
        if (error instanceof InvalidCredentialsException)
        {
            set.status = 400;

            return {
                statusCode: 400,
                message: error.message,
                error: "Bad Request",
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
