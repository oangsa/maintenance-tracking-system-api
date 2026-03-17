import { RefreshToken } from "../../Infrastructures/Entities/Auth/RefreshToken";

export interface CreateRefreshTokenData
{
    userId: number;
    tokenHash: string;
    expiresAt: string;
    userAgent?: string | null;
    ipAddress?: string | null;
}

export interface IRefreshTokenRepository
{
    FindById(id: number): Promise<RefreshToken | null>;
    Create(data: CreateRefreshTokenData): Promise<RefreshToken>;
    DeleteById(id: number): Promise<void>;
    DeleteAllByUserId(userId: number): Promise<void>;
    DeleteExpired(): Promise<void>;
}
