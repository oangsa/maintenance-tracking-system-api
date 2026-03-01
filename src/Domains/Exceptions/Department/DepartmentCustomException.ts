import { CustomException } from "../CustomException";

export class DepartmentCustomException extends CustomException
{
    constructor( statusCode: number, responseCode: string, errorMessage: string, ...responseData: object[])
    {
        super( statusCode, responseCode, errorMessage, ...responseData);
        this.name = 'DepartmentCustomException';
    }
}
