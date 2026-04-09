import Elysia from "elysia";
import { ErrorMessages } from "../../Shared/Constants/ErrorMessage";
import { ILoggerService } from "../../Applications/Services/ILoggerService";


export const ErrorHandlerPlugin = (logger: ILoggerService) =>
    new Elysia({ name: "error-handler" })
    .onError({ as: "global" }, ({ code, error, set }) =>
    {
        switch (code)
        {
            case "VALIDATION":
            {
                const firstError = (error as any).all?.[0];
                const path = firstError?.path ?? "";
                const message = firstError?.message ?? error.message;
                const field = path.replace("/", "") || "body";

                logger.warn("Request validation failed", {
                    code,
                    field,
                    message,
                });

                set.status = 422;
                return {
                    statusCode: 422,
                    message: `Validation failed on '${field}': ${message}`,
                    error: "Unprocessable Entity",
                };
            }

            case "NOT_FOUND":
                logger.warn("Route not found", {
                    code,
                    message: (error as any).message,
                });
                set.status = 404;
                return {
                    statusCode: 404,
                    message: (error as any).message,
                    error: "Not Found",
                };

            case "PARSE":
                logger.warn("Request parse failed", {
                    code,
                    message: "Invalid JSON body",
                });
                set.status = 400;
                return {
                    statusCode: 400,
                    message: "Invalid JSON body",
                    error: "Bad Request",
                };

            case "INTERNAL_SERVER_ERROR":
            default:
            {
                const err = error as any;
                const pgCode: string | undefined = err?.code;

                if (pgCode && ErrorMessages.PG_ERROR_MESSAGES[pgCode])
                {
                    const mapped = ErrorMessages.PG_ERROR_MESSAGES[pgCode];
                    set.status = mapped.status;
                    return { statusCode: mapped.status, message: mapped.message, error: mapped.error };
                }

                const rawMessage: string = err?.message ?? "An unexpected error occurred";
                const cleanMessage = rawMessage.startsWith("Failed query:")
                    ? "Database operation failed."
                    : rawMessage;

                logger.error("Unhandled application error", error, {
                    code,
                    pgCode,
                    message: cleanMessage,
                });

                set.status = 500;
                return {
                    statusCode: 500,
                    message: cleanMessage,
                    error: "Internal Server Error",
                };
            }
        }
    });
