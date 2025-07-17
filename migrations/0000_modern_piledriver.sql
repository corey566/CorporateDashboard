CREATE TABLE "agent_target_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"cycle_start_date" timestamp NOT NULL,
	"cycle_end_date" timestamp NOT NULL,
	"target_cycle" text NOT NULL,
	"volume_target" numeric(10, 2) NOT NULL,
	"units_target" integer NOT NULL,
	"volume_achieved" numeric(10, 2) DEFAULT '0' NOT NULL,
	"units_achieved" integer DEFAULT 0 NOT NULL,
	"total_sales" integer DEFAULT 0 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"photo" text,
	"team_id" integer NOT NULL,
	"category" text NOT NULL,
	"volume_target" numeric(10, 2) DEFAULT '0' NOT NULL,
	"units_target" integer DEFAULT 0 NOT NULL,
	"target_cycle" text DEFAULT 'monthly' NOT NULL,
	"reset_day" integer DEFAULT 1 NOT NULL,
	"reset_month" integer DEFAULT 1,
	"is_active" boolean DEFAULT true NOT NULL,
	"username" text,
	"password" text,
	"can_self_report" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "agents_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"sound_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cash_offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"reward" numeric(10, 2) NOT NULL,
	"type" text NOT NULL,
	"target" numeric(10, 2) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "file_uploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"original_name" text NOT NULL,
	"filename" text NOT NULL,
	"mimetype" text NOT NULL,
	"size" integer NOT NULL,
	"path" text NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_slides" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"url" text,
	"content" text,
	"duration" integer DEFAULT 10 NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "news_ticker" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"units" integer DEFAULT 1 NOT NULL,
	"category" text NOT NULL,
	"client_name" text NOT NULL,
	"description" text,
	"subscription_period" text,
	"cycle_start_date" timestamp NOT NULL,
	"cycle_end_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sound_effects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"event_type" text NOT NULL,
	"file_url" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"volume" real DEFAULT 0.5 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"type" varchar(50) DEFAULT 'string' NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "team_target_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"cycle_start_date" timestamp NOT NULL,
	"cycle_end_date" timestamp NOT NULL,
	"target_cycle" text NOT NULL,
	"volume_target" numeric(10, 2) NOT NULL,
	"units_target" integer NOT NULL,
	"volume_achieved" numeric(10, 2) DEFAULT '0' NOT NULL,
	"units_achieved" integer DEFAULT 0 NOT NULL,
	"total_sales" integer DEFAULT 0 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#2563eb' NOT NULL,
	"volume_target" numeric(10, 2) DEFAULT '0' NOT NULL,
	"units_target" integer DEFAULT 0 NOT NULL,
	"target_cycle" text DEFAULT 'monthly' NOT NULL,
	"reset_day" integer DEFAULT 1 NOT NULL,
	"reset_month" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "agent_target_history" ADD CONSTRAINT "agent_target_history_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_target_history" ADD CONSTRAINT "team_target_history_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;