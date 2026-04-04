import { ErrorMessages } from "@/Shared/Constants/ErrorMessage";

export abstract class CustomException extends Error
{
    public readonly statusCode: number;
    public readonly responseCode: string;
    public readonly responseData: object[];
    public override message: string;

    protected constructor( statusCode: number, responseCode: string, errorMessage: string, ...responseData: object[])
    {
        super(errorMessage);
        this.name = 'CustomException';
        this.statusCode = statusCode;
        this.responseCode = responseCode;
        this.message = errorMessage;
        this.responseData = responseData;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class CustomMessageException extends CustomException
{
    constructor( statusCode: number, responseCode: string, messageParams: string[], ...responseData: object[])
    {
        super( statusCode, responseCode, CustomMessageException.formatMessage(responseCode, messageParams), ...responseData);
        this.name = 'CustomMessageException';
    }

    private static formatMessage(responseCode: string, messageParams: string[]): string
    {
        const errorMessage = ErrorMessages.Messages.get(responseCode);

        if (!errorMessage)
        {
            throw new Error(`Error message for ResponseCode '${responseCode}' was not found.`);
        }

        if (messageParams && messageParams.length > 0)
        {
            return errorMessage.replaceAll(/{(\d+)}/g, (match, index) =>
                {
                    const paramIndex = Number.parseInt(index, 10);
                    return messageParams[paramIndex] ?? match;
                });
        }

        return errorMessage;
    }
}
