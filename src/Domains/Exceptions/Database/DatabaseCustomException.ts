import { CustomException } from "../CustomException";
import { ErrorMessages } from "../../../Shared/Constants/ErrorMessage";

export class DatabaseConnectionException extends CustomException
{
    constructor(message?: string)
    {
        super(
            500,
            "DB001",
            message || ErrorMessages.Messages.get("DB001") || "Database connection failed"
        );
        this.name = "DatabaseConnectionException";
    }
}
