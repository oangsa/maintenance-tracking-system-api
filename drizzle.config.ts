import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/Infrastructures/Database/schema.ts",
  out: "./src/Infrastructures/Database/Drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
