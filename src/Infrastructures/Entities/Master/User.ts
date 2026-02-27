import { users } from "../../Database/Drizzle/schema";

export type User = typeof users.$inferSelect;
