export interface CurrentUserDto
{
    userId: number;
    name: string | null;
    role: string;
    tokenVersion: number;
};
