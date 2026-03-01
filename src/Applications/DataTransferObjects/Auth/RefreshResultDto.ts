export interface RefreshResultDto
{
    refreshTokenId: number;
    rawRefreshToken: string;
    userId: number;
    email: string;
    role: string;
    tokenVersion: number;
};
