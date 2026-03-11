export const initSQL = `
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "challenges_log" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "challenges_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"challenge_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"site_id" integer NOT NULL,
	"resource_id" integer NOT NULL,
	"ttl" integer NOT NULL,
	"difficulty" integer NOT NULL,
	"correctly_answered" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"answered_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "difficulty_config" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "difficulty_config_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"site_id" integer NOT NULL,
	"resource_id" integer,
	"difficulty_config" jsonb DEFAULT '{"default":200000,"custom":[]}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "resources" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "resources_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"site_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "settings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sites" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sites_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"site_key" text NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sites_siteKey_unique" UNIQUE("site_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"email" text,
	"password" text,
	"jwt_secret" text DEFAULT '' NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ 
BEGIN 
    -- 1. challenges_log_site_id_sites_id_fk
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'challenges_log_site_id_sites_id_fk') THEN
        ALTER TABLE "challenges_log" ADD CONSTRAINT "challenges_log_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE cascade;
    END IF;

    -- 2. challenges_log_resource_id_resources_id_fk
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'challenges_log_resource_id_resources_id_fk') THEN
        ALTER TABLE "challenges_log" ADD CONSTRAINT "challenges_log_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE cascade;
    END IF;

    -- 3. challenges_log_user_id_users_id_fk
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'challenges_log_user_id_users_id_fk') THEN
        ALTER TABLE "challenges_log" ADD CONSTRAINT "challenges_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
    END IF;

    -- 4. difficulty_config_site_id_sites_id_fk
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'difficulty_config_site_id_sites_id_fk') THEN
        ALTER TABLE "difficulty_config" ADD CONSTRAINT "difficulty_config_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE cascade;
    END IF;

    -- 5. difficulty_config_resource_id_resources_id_fk
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'difficulty_config_resource_id_resources_id_fk') THEN
        ALTER TABLE "difficulty_config" ADD CONSTRAINT "difficulty_config_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE cascade;
    END IF;

    -- 6. resources_site_id_sites_id_fk
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'resources_site_id_sites_id_fk') THEN
        ALTER TABLE "resources" ADD CONSTRAINT "resources_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE cascade;
    END IF;

    -- 7. sites_user_id_users_id_fk
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sites_user_id_users_id_fk') THEN
        ALTER TABLE "sites" ADD CONSTRAINT "sites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS "idx_log_created-at_uid" ON "challenges_log" USING btree ("created_at","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_log_uid" ON "challenges_log" USING btree ("user_id");`;
