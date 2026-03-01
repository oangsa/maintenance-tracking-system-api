export interface RefreshResultDto
{
    refreshTokenId: number;
    rawRefreshToken: string;
    userId: number;
    role: string;
    tokenVersion: number;
};
