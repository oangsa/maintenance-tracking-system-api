import { sql } from "drizzle-orm";
import { IRefreshTokenRepository, CreateRefreshTokenData } from "@/Domains/Repositories/IRefreshTokenRepository";
import { RefreshToken } from "../../Entities/Auth/RefreshToken";
import { AppDrizzleDB } from "../../Database/Drizzle";
import { refreshToken } from "../../Database/Drizzle/schema";

type RefreshTokenRow = {
    id: number;
    user_id: number;
    token_hash: string;
    expires_at: string;
    revoked: boolean;
    user_agent: string | null;
    ip_address: string | null;
    created_at: string;
};

export class RefreshTokenRepository implements IRefreshTokenRepository
{
    private readonly _db: AppDrizzleDB;

    constructor(db: AppDrizzleDB)
    {
        this._db = db;
    }

    private mapRowToRefreshToken(row: RefreshTokenRow): RefreshToken
    {
        return {
            id: row.id,
            userId: row.user_id,
            tokenHash: row.token_hash,
            expiresAt: new Date(row.expires_at),
            revoked: row.revoked,
            userAgent: row.user_agent,
            ipAddress: row.ip_address,
            createdAt: new Date(row.created_at),
        };
    }

    async FindById(id: number): Promise<RefreshToken | null>
    {
        const result = await this._db.db.execute<RefreshTokenRow>(sql`
            SELECT id, user_id, token_hash, expires_at, revoked, user_agent, ip_address, created_at
            FROM ${refreshToken}
            WHERE id = ${id}
              AND revoked = false
            LIMIT 1
        `);

        if (!result || result.length === 0) return null;

        return this.mapRowToRefreshToken(result[0]!);
    }

    async Create(data: CreateRefreshTokenData): Promise<RefreshToken>
    {
        const result = await this._db.db.execute<RefreshTokenRow>(sql`
            INSERT INTO ${refreshToken} (user_id, token_hash, expires_at, user_agent, ip_address)
            VALUES (
                ${data.userId},
                ${data.tokenHash},
                ${data.expiresAt},
                ${data.userAgent ?? null},
                ${data.ipAddress ?? null}
            )
            RETURNING id, user_id, token_hash, expires_at, revoked, user_agent, ip_address, created_at
        `);

        return this.mapRowToRefreshToken(result[0]!);
    }

    async DeleteById(id: number): Promise<void>
    {
        await this._db.db.execute(sql`
            DELETE FROM ${refreshToken}
            WHERE id = ${id}
        `);
    }

    async DeleteAllByUserId(userId: number): Promise<void>
    {
        await this._db.db.execute(sql`
            DELETE FROM ${refreshToken}
            WHERE user_id = ${userId}
        `);
    }

    async DeleteExpired(): Promise<void>
    {
        await this._db.db.execute(sql`
            DELETE FROM ${refreshToken}
            WHERE expires_at < NOW()
        `);
    }
}
