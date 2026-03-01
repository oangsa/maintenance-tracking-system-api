import { JWTPayload, SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();

export async function signToken( payload: JWTPayload, secretKey: string, options?: { expiresIn?: string | number }): Promise<string> {
    const jwt = new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt();

    if (options?.expiresIn)
    {
        jwt.setExpirationTime(options.expiresIn);
    }

    return await jwt.sign(encoder.encode(secretKey));
}

export async function verifyToken( token: string, secretKey: string): Promise<JWTPayload> {
    try
    {
        const { payload } = await jwtVerify(token, encoder.encode(secretKey), { algorithms: ["HS256"] });

        return payload;
    }
    catch
    {
        throw new Error("Invalid or expired token");
    }
}
