import { LoginResultDto } from "../DataTransferObjects/Auth/LoginResultDto";
import { RefreshResultDto } from "../DataTransferObjects/Auth/RefreshResultDto";

export interface IAuthService
{
    Login(email: string, password: string, userAgent?: string, ipAddress?: string): Promise<LoginResultDto>;
    Refresh(tokenId: number, rawToken: string, userAgent?: string, ipAddress?: string): Promise<RefreshResultDto>;
    Logout(tokenId: number): Promise<void>;
    LogoutAll(userId: number): Promise<void>;
    ValidateTokenVersion(userId: number, tokenVersion: number): Promise<boolean>;
}
