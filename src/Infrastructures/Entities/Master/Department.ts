import { department } from "../../Database/Drizzle/schema";

export type Department = typeof department.$inferSelect;
