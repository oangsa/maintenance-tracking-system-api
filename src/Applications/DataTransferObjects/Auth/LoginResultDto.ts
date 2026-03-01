import { UserDto } from "../User/UserDto";

export interface LoginResultDto
{
    refreshTokenId: number;
    rawRefreshToken: string;
    user: UserDto;
    tokenVersion: number;
};
