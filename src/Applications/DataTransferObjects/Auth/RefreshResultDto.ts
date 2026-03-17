export interface RefreshResultDto
{
    refreshTokenId: number;
    rawRefreshToken: string;
    userId: number;
    name: string | null;
    role: string;
    tokenVersion: number;
};
