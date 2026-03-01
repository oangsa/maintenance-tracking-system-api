import bcrybtjs from "bcryptjs";

export async function hashPassword(password: string): Promise<string>
{
    const hashedPassword = await bcrybtjs.hash(password, 10);

    return hashedPassword;
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean>
{
    const isValid = await bcrybtjs.compare(password, hashedPassword);

    return isValid;
}
