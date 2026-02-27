import { CustomException } from "../CustomException";

export class UserCustomException extends CustomException
{
    constructor( statusCode: number, responseCode: string, errorMessage: string, ...responseData: object[])
    {
        super( statusCode, responseCode, errorMessage, ...responseData);
        this.name = 'UserCustomException';
    }
}
