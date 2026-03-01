import { refreshToken } from "../../Database/Drizzle/schema";

export type RefreshToken = typeof refreshToken.$inferSelect;
