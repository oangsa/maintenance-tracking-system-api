// DUP - Dupliicate Error
// AUT - Authentication Error
// VAL - Validation Error
// DB - Database Error
// NOF - Not Found Error

export class ErrorMessages
{
    public static readonly Messages: Map<string, string> = new Map<string, string>(
        [
            ["DUP001", "Duplicate data found. Please check your input."],
            ["NOF001", "The requested data or resource was not found."],
            ["AUT001", "Access token has expired. Please refresh the token."],
            ["AUT002", "Refresh token has expired. Please log in again."],
            ["DB001", "Database connection failed."],
            ["DB002", "DATABASE_URL environment variable is not set."],
        ]
    )

    public static readonly PG_ERROR_MESSAGES: { [code: string]: { status: number; message: string; error: string } } = {
        "23505": { status: 409, message: "A record with this value already exists.", error: "Conflict" },
        "23503": { status: 400, message: "Referenced record does not exist.", error: "Bad Request" },
        "23502": { status: 400, message: "A required field is missing.", error: "Bad Request" },
        "23514": { status: 400, message: "A value failed a check constraint.", error: "Bad Request" },
        "22P02": { status: 400, message: "Invalid input value for a field.", error: "Bad Request" },
    };
}
