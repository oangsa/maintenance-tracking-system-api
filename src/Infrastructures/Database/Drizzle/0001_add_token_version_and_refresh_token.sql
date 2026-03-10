CREATE TABLE IF NOT EXISTS "refresh_token" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL,
	"user_agent" text,
	"ip_address" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "token_version" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'refresh_token_user_id_fkey'
  ) THEN
    ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_refresh_token_expires_at" ON "refresh_token" USING btree ("expires_at" timestamptz_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_refresh_token_user_id" ON "refresh_token" USING btree ("user_id" int4_ops);