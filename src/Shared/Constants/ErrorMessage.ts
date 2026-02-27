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
}
