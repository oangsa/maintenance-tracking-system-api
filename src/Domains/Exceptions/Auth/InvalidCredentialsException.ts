import { BadRequestException } from "../BadRequestException";

export class InvalidCredentialsException extends BadRequestException
{
    constructor()
    {
        super("Invalid email or password.");
        this.name = "InvalidCredentialsException";
    }
}
