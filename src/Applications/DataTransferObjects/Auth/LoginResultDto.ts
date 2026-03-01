import { UserDto } from "../User/UserDto";

export type LoginResultDto = {
    refreshTokenId: number;
    rawRefreshToken: string;
    user: UserDto;
    tokenVersion: number;
};
