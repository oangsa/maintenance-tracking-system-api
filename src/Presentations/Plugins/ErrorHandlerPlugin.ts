import Elysia from "elysia";
import { ErrorMessages } from "../../Shared/Constants/ErrorMessage";


export const ErrorHandlerPlugin = new Elysia({ name: "error-handler" })
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

                set.status = 422;
                return {
                    statusCode: 422,
                    message: `Validation failed on '${field}': ${message}`,
                    error: "Unprocessable Entity",
                };
            }

            case "NOT_FOUND":
                set.status = 404;
                return {
                    statusCode: 404,
                    message: (error as any).message,
                    error: "Not Found",
                };

            case "PARSE":
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

                set.status = 500;
                return {
                    statusCode: 500,
                    message: cleanMessage,
                    error: "Internal Server Error",
                };
            }
        }
    });
