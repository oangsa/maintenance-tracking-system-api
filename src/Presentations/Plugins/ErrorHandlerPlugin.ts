import Elysia from "elysia";

const PG_ERROR_MESSAGES: Record<string, { status: number; message: string; error: string }> = {
    "23505": { status: 409, message: "A record with this value already exists.", error: "Conflict" },
    "23503": { status: 400, message: "Referenced record does not exist.", error: "Bad Request" },
    "23502": { status: 400, message: "A required field is missing.", error: "Bad Request" },
    "23514": { status: 400, message: "A value failed a check constraint.", error: "Bad Request" },
    "22P02": { status: 400, message: "Invalid input value for a field.", error: "Bad Request" },
};

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

                // Known PostgreSQL SQLSTATE codes
                if (pgCode && PG_ERROR_MESSAGES[pgCode])
                {
                    const mapped = PG_ERROR_MESSAGES[pgCode];
                    set.status = mapped.status;
                    return { statusCode: mapped.status, message: mapped.message, error: mapped.error };
                }

                // Strip raw SQL from postgres-js "Failed query:" messages
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
