import { UserDto } from "../User/UserDto";

export interface AuthDto
{
    accessToken: string;
    user: UserDto;
}
