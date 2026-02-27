-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."inventory_move_reason" AS ENUM('buy', 'use', 'lost', 'found', 'adjust');--> statement-breakpoint
CREATE TYPE "public"."repair_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."roles_enum" AS ENUM('admin', 'manager', 'employee');--> statement-breakpoint
CREATE TABLE "inventory_move" (
	"id" serial PRIMARY KEY NOT NULL,
	"move_no" varchar(50) NOT NULL,
	"reason" "inventory_move_reason" NOT NULL,
	"move_date" timestamp with time zone DEFAULT now(),
	"remark" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(50),
	"updated_by" varchar(50),
	"deleted" boolean DEFAULT false,
	CONSTRAINT "inventory_move_move_no_key" UNIQUE("move_no")
);
--> statement-breakpoint
CREATE TABLE "inventory_move_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"inventory_move_id" integer NOT NULL,
	"part_id" integer NOT NULL,
	"quantity_in" integer DEFAULT 0,
	"quantity_out" integer DEFAULT 0,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(50),
	"updated_by" varchar(50),
	"deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "part" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(150) NOT NULL,
	"product_type_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(150),
	"updated_by" varchar(150),
	"deleted" boolean DEFAULT false,
	CONSTRAINT "part_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "product_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(150) NOT NULL,
	"department_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(150),
	"updated_by" varchar(150),
	"deleted" boolean DEFAULT false,
	CONSTRAINT "product_type_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "department" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(150) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(150),
	"updated_by" varchar(150),
	"deleted" boolean DEFAULT false,
	CONSTRAINT "department_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(150) NOT NULL,
	"product_type_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(150),
	"updated_by" varchar(150),
	"deleted" boolean DEFAULT false,
	CONSTRAINT "product_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "work_order" (
	"id" serial PRIMARY KEY NOT NULL,
	"repair_request_id" integer NOT NULL,
	"scheduled_start" timestamp with time zone,
	"scheduled_end" timestamp with time zone,
	"order_sequence" integer NOT NULL,
	"is_final" boolean DEFAULT false,
	"status_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(150),
	"updated_by" varchar(150),
	CONSTRAINT "work_order_repair_request_id_order_sequence_key" UNIQUE("repair_request_id","order_sequence")
);
--> statement-breakpoint
CREATE TABLE "repair_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"order_sequence" integer NOT NULL,
	"is_final" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(150),
	"updated_by" varchar(150),
	"deleted" boolean DEFAULT false,
	CONSTRAINT "repair_status_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "repair_request" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_no" varchar(50) NOT NULL,
	"requester_id" integer NOT NULL,
	"department_id" integer NOT NULL,
	"priority" "repair_priority" NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now(),
	"current_status_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(150),
	"updated_by" varchar(150),
	"deleted" boolean DEFAULT false,
	CONSTRAINT "repair_request_request_no_key" UNIQUE("request_no")
);
--> statement-breakpoint
CREATE TABLE "repair_request_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"repair_request_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"description" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(150),
	"updated_by" varchar(150)
);
--> statement-breakpoint
CREATE TABLE "work_task" (
	"id" serial PRIMARY KEY NOT NULL,
	"work_order_id" integer NOT NULL,
	"description" text NOT NULL,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(150),
	"updated_by" varchar(150)
);
--> statement-breakpoint
CREATE TABLE "repair_request_status_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"repair_request_id" integer NOT NULL,
	"old_status_id" integer,
	"new_status_id" integer NOT NULL,
	"changed_by" integer,
	"note" text,
	"changed_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(150),
	"updated_by" varchar(150)
);
--> statement-breakpoint
CREATE TABLE "work_order_part" (
	"id" serial PRIMARY KEY NOT NULL,
	"work_order_id" integer NOT NULL,
	"part_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(150),
	"updated_by" varchar(150)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(150) NOT NULL,
	"password_hash" text,
	"name" varchar(150),
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(150),
	"updated_by" varchar(150),
	"deleted" boolean DEFAULT false,
	"role" "roles_enum" NOT NULL,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_department" (
	"user_id" integer NOT NULL,
	"department_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(150),
	"updated_by" varchar(150),
	CONSTRAINT "user_department_pkey" PRIMARY KEY("user_id","department_id")
);
--> statement-breakpoint
ALTER TABLE "inventory_move_item" ADD CONSTRAINT "inventory_move_item_inventory_move_id_fkey" FOREIGN KEY ("inventory_move_id") REFERENCES "public"."inventory_move"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_move_item" ADD CONSTRAINT "inventory_move_item_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "public"."part"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part" ADD CONSTRAINT "part_product_type_id_fkey" FOREIGN KEY ("product_type_id") REFERENCES "public"."product_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_type" ADD CONSTRAINT "product_type_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_product_type_id_fkey" FOREIGN KEY ("product_type_id") REFERENCES "public"."product_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_repair_request_id_fkey" FOREIGN KEY ("repair_request_id") REFERENCES "public"."repair_request"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "public"."repair_status"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_request" ADD CONSTRAINT "repair_request_current_status_id_fkey" FOREIGN KEY ("current_status_id") REFERENCES "public"."repair_status"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_request" ADD CONSTRAINT "repair_request_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_request" ADD CONSTRAINT "repair_request_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_request_item" ADD CONSTRAINT "repair_request_item_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_request_item" ADD CONSTRAINT "repair_request_item_repair_request_id_fkey" FOREIGN KEY ("repair_request_id") REFERENCES "public"."repair_request"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_task" ADD CONSTRAINT "work_task_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_request_status_log" ADD CONSTRAINT "repair_request_status_log_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_request_status_log" ADD CONSTRAINT "repair_request_status_log_new_status_id_fkey" FOREIGN KEY ("new_status_id") REFERENCES "public"."repair_status"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_request_status_log" ADD CONSTRAINT "repair_request_status_log_old_status_id_fkey" FOREIGN KEY ("old_status_id") REFERENCES "public"."repair_status"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_request_status_log" ADD CONSTRAINT "repair_request_status_log_repair_request_id_fkey" FOREIGN KEY ("repair_request_id") REFERENCES "public"."repair_request"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_part" ADD CONSTRAINT "work_order_part_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "public"."part"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_part" ADD CONSTRAINT "work_order_part_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_department" ADD CONSTRAINT "user_department_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_department" ADD CONSTRAINT "user_department_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
*/