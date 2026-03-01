import { AuthDto } from "../DataTransferObjects/Auth/AuthDto";

export interface IAuthService
{
    Login(email: string, password: string): Promise<AuthDto>;
}
