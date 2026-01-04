


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."project_status" AS ENUM (
    'Casting',
    'On Hiatus',
    'On Hold',
    'Ordered',
    'Pre-Prod.',
    'See Notes',
    'Shooting',
    'Suspended',
    'Undetermined',
    'Canceled',
    'Relocated',
    'Unknown',
    'Wrapped'
);


ALTER TYPE "public"."project_status" OWNER TO "postgres";


CREATE TYPE "public"."project_type" AS ENUM (
    'Feature Film',
    'Feature Film (ULB)',
    'Feature Film (MLB)',
    'Feature Film (MPA)',
    'Feature Film (LB)',
    'TV Daytime',
    'TV One Hour',
    'TV 1/2 Hour',
    'TV Movie',
    'TV Mini-Series',
    'TV Animation',
    'TV Sketch/Improv',
    'TV Talk/Variety',
    'Pilot Presentation',
    'Pilot One Hour',
    'Pilot 1/2 Hour',
    'New Media',
    'Short Film',
    'Podcast'
);


ALTER TYPE "public"."project_type" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."addresses" (
    "id" bigint NOT NULL,
    "street1" "text",
    "street2" "text",
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "zip" "text",
    "address_type" "text",
    "location" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "valid_address" CHECK ((("city" IS NOT NULL) AND ("state" IS NOT NULL)))
);


ALTER TABLE "public"."addresses" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."addresses_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."addresses_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."addresses_id_seq" OWNED BY "public"."addresses"."id";



CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "text" NOT NULL,
    "body" "text" NOT NULL,
    "html_body" "text",
    "collection_name" "text" NOT NULL,
    "object_id" "text" NOT NULL,
    "user_id" "text" NOT NULL,
    "parent_comment_id" "text",
    "top_level_comment_id" "text",
    "created_at" timestamp with time zone NOT NULL,
    "posted_at" timestamp with time zone,
    CONSTRAINT "valid_collection" CHECK (("collection_name" = ANY (ARRAY['Projects'::"text", 'Offices'::"text", 'Contacts'::"text", 'PastProjects'::"text"])))
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_addresses" (
    "id" bigint NOT NULL,
    "contact_id" "text" NOT NULL,
    "address_id" bigint NOT NULL
);


ALTER TABLE "public"."contact_addresses" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."contact_addresses_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."contact_addresses_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."contact_addresses_id_seq" OWNED BY "public"."contact_addresses"."id";



CREATE TABLE IF NOT EXISTS "public"."contact_links" (
    "id" bigint NOT NULL,
    "contact_id" "text" NOT NULL,
    "link_id" bigint NOT NULL
);


ALTER TABLE "public"."contact_links" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."contact_links_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."contact_links_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."contact_links_id_seq" OWNED BY "public"."contact_links"."id";



CREATE TABLE IF NOT EXISTS "public"."contact_past_projects" (
    "id" bigint NOT NULL,
    "contact_id" "text" NOT NULL,
    "project_id" "text" NOT NULL,
    "title_for_project" "text"
);


ALTER TABLE "public"."contact_past_projects" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."contact_past_projects_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."contact_past_projects_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."contact_past_projects_id_seq" OWNED BY "public"."contact_past_projects"."id";



CREATE TABLE IF NOT EXISTS "public"."contact_projects" (
    "id" bigint NOT NULL,
    "contact_id" "text" NOT NULL,
    "project_id" "text" NOT NULL,
    "title_for_project" "text"
);


ALTER TABLE "public"."contact_projects" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."contact_projects_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."contact_projects_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."contact_projects_id_seq" OWNED BY "public"."contact_projects"."id";



CREATE TABLE IF NOT EXISTS "public"."contacts" (
    "id" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "title" "text",
    "gender" "text",
    "slug" "text" NOT NULL,
    "user_id" "text" NOT NULL,
    "the_address" "text",
    "address_string" "text",
    "body" "text",
    "html_body" "text",
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."links" (
    "id" bigint NOT NULL,
    "platform_name" "text" NOT NULL,
    "profile_name" "text" NOT NULL,
    "profile_link" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."links" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."links_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."links_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."links_id_seq" OWNED BY "public"."links"."id";



CREATE TABLE IF NOT EXISTS "public"."office_addresses" (
    "id" bigint NOT NULL,
    "office_id" "text" NOT NULL,
    "address_id" bigint NOT NULL
);


ALTER TABLE "public"."office_addresses" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."office_addresses_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."office_addresses_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."office_addresses_id_seq" OWNED BY "public"."office_addresses"."id";



CREATE TABLE IF NOT EXISTS "public"."office_contacts" (
    "id" bigint NOT NULL,
    "office_id" "text" NOT NULL,
    "contact_id" "text" NOT NULL
);


ALTER TABLE "public"."office_contacts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."office_contacts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."office_contacts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."office_contacts_id_seq" OWNED BY "public"."office_contacts"."id";



CREATE TABLE IF NOT EXISTS "public"."office_links" (
    "id" bigint NOT NULL,
    "office_id" "text" NOT NULL,
    "link_id" bigint NOT NULL
);


ALTER TABLE "public"."office_links" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."office_links_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."office_links_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."office_links_id_seq" OWNED BY "public"."office_links"."id";



CREATE TABLE IF NOT EXISTS "public"."office_past_projects" (
    "id" bigint NOT NULL,
    "office_id" "text" NOT NULL,
    "project_id" "text" NOT NULL
);


ALTER TABLE "public"."office_past_projects" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."office_past_projects_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."office_past_projects_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."office_past_projects_id_seq" OWNED BY "public"."office_past_projects"."id";



CREATE TABLE IF NOT EXISTS "public"."office_phones" (
    "id" bigint NOT NULL,
    "office_id" "text" NOT NULL,
    "phone_number_as_input" "text",
    "phone_number_type" "text",
    "phone_number" "text",
    "national_format" "text",
    "country_code" "text"
);


ALTER TABLE "public"."office_phones" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."office_phones_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."office_phones_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."office_phones_id_seq" OWNED BY "public"."office_phones"."id";



CREATE TABLE IF NOT EXISTS "public"."office_projects" (
    "id" bigint NOT NULL,
    "office_id" "text" NOT NULL,
    "project_id" "text" NOT NULL
);


ALTER TABLE "public"."office_projects" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."office_projects_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."office_projects_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."office_projects_id_seq" OWNED BY "public"."office_projects"."id";



CREATE TABLE IF NOT EXISTS "public"."offices" (
    "id" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "user_id" "text" NOT NULL,
    "body" "text",
    "html_body" "text",
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."offices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."past_project_links" (
    "id" bigint NOT NULL,
    "project_id" "text" NOT NULL,
    "link_id" bigint NOT NULL
);


ALTER TABLE "public"."past_project_links" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."past_project_links_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."past_project_links_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."past_project_links_id_seq" OWNED BY "public"."past_project_links"."id";



CREATE TABLE IF NOT EXISTS "public"."past_projects" (
    "id" "text" NOT NULL,
    "project_title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "user_id" "text" NOT NULL,
    "project_type" "public"."project_type",
    "union" "text",
    "network" "text",
    "status" "public"."project_status",
    "platform_type" "text",
    "website" "text",
    "season" "text",
    "order" "text",
    "renewed" boolean,
    "shooting_location" "text",
    "summary" "text",
    "html_summary" "text",
    "notes" "text",
    "html_notes" "text",
    "casting_company" "text",
    "sort_title" "text",
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."past_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_links" (
    "id" bigint NOT NULL,
    "project_id" "text" NOT NULL,
    "link_id" bigint NOT NULL
);


ALTER TABLE "public"."project_links" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."project_links_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."project_links_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."project_links_id_seq" OWNED BY "public"."project_links"."id";



CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "text" NOT NULL,
    "project_title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "user_id" "text" NOT NULL,
    "project_type" "public"."project_type",
    "union" "text",
    "network" "text",
    "status" "public"."project_status",
    "platform_type" "text",
    "website" "text",
    "season" "text",
    "order" "text",
    "renewed" boolean,
    "shooting_location" "text",
    "summary" "text",
    "html_summary" "text",
    "notes" "text",
    "html_notes" "text",
    "casting_company" "text",
    "sort_title" "text",
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."statistics" (
    "id" "text" NOT NULL,
    "data" "jsonb",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."statistics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_emails" (
    "id" bigint NOT NULL,
    "user_id" "text" NOT NULL,
    "address" "text" NOT NULL,
    "verified" boolean DEFAULT false,
    "is_primary" boolean DEFAULT false,
    CONSTRAINT "email_format" CHECK (("address" ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'::"text"))
);


ALTER TABLE "public"."user_emails" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_emails_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."user_emails_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_emails_id_seq" OWNED BY "public"."user_emails"."id";



CREATE TABLE IF NOT EXISTS "public"."user_groups" (
    "id" bigint NOT NULL,
    "user_id" "text" NOT NULL,
    "group_name" "text" NOT NULL
);


ALTER TABLE "public"."user_groups" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_groups_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."user_groups_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_groups_id_seq" OWNED BY "public"."user_groups"."id";



CREATE TABLE IF NOT EXISTS "public"."user_preferences" (
    "id" bigint NOT NULL,
    "user_id" "text" NOT NULL,
    "notifications_comments" boolean DEFAULT true,
    "notifications_posts" boolean DEFAULT true,
    "notifications_replies" boolean DEFAULT true,
    "notifications_users" boolean DEFAULT false
);


ALTER TABLE "public"."user_preferences" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_preferences_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."user_preferences_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_preferences_id_seq" OWNED BY "public"."user_preferences"."id";



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "text" NOT NULL,
    "username" "text",
    "display_name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "email" "text",
    "email_hash" "text",
    "is_admin" boolean DEFAULT false,
    "locale" "text" DEFAULT 'en'::"text",
    "bio" "text",
    "html_bio" "text",
    "website" "text",
    "twitter_username" "text",
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone,
    "auth_methods" "jsonb",
    CONSTRAINT "email_format" CHECK ((("email" IS NULL) OR ("email" ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'::"text")))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."addresses" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."addresses_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."contact_addresses" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."contact_addresses_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."contact_links" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."contact_links_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."contact_past_projects" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."contact_past_projects_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."contact_projects" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."contact_projects_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."links" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."links_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."office_addresses" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."office_addresses_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."office_contacts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."office_contacts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."office_links" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."office_links_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."office_past_projects" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."office_past_projects_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."office_phones" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."office_phones_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."office_projects" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."office_projects_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."past_project_links" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."past_project_links_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."project_links" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."project_links_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_emails" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_emails_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_groups" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_groups_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_preferences" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_preferences_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_addresses"
    ADD CONSTRAINT "contact_addresses_contact_id_address_id_key" UNIQUE ("contact_id", "address_id");



ALTER TABLE ONLY "public"."contact_addresses"
    ADD CONSTRAINT "contact_addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_links"
    ADD CONSTRAINT "contact_links_contact_id_link_id_key" UNIQUE ("contact_id", "link_id");



ALTER TABLE ONLY "public"."contact_links"
    ADD CONSTRAINT "contact_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_past_projects"
    ADD CONSTRAINT "contact_past_projects_contact_id_project_id_key" UNIQUE ("contact_id", "project_id");



ALTER TABLE ONLY "public"."contact_past_projects"
    ADD CONSTRAINT "contact_past_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_projects"
    ADD CONSTRAINT "contact_projects_contact_id_project_id_key" UNIQUE ("contact_id", "project_id");



ALTER TABLE ONLY "public"."contact_projects"
    ADD CONSTRAINT "contact_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."links"
    ADD CONSTRAINT "links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."office_addresses"
    ADD CONSTRAINT "office_addresses_office_id_address_id_key" UNIQUE ("office_id", "address_id");



ALTER TABLE ONLY "public"."office_addresses"
    ADD CONSTRAINT "office_addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."office_contacts"
    ADD CONSTRAINT "office_contacts_office_id_contact_id_key" UNIQUE ("office_id", "contact_id");



ALTER TABLE ONLY "public"."office_contacts"
    ADD CONSTRAINT "office_contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."office_links"
    ADD CONSTRAINT "office_links_office_id_link_id_key" UNIQUE ("office_id", "link_id");



ALTER TABLE ONLY "public"."office_links"
    ADD CONSTRAINT "office_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."office_past_projects"
    ADD CONSTRAINT "office_past_projects_office_id_project_id_key" UNIQUE ("office_id", "project_id");



ALTER TABLE ONLY "public"."office_past_projects"
    ADD CONSTRAINT "office_past_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."office_phones"
    ADD CONSTRAINT "office_phones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."office_projects"
    ADD CONSTRAINT "office_projects_office_id_project_id_key" UNIQUE ("office_id", "project_id");



ALTER TABLE ONLY "public"."office_projects"
    ADD CONSTRAINT "office_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."offices"
    ADD CONSTRAINT "offices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."offices"
    ADD CONSTRAINT "offices_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."past_project_links"
    ADD CONSTRAINT "past_project_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."past_project_links"
    ADD CONSTRAINT "past_project_links_project_id_link_id_key" UNIQUE ("project_id", "link_id");



ALTER TABLE ONLY "public"."past_projects"
    ADD CONSTRAINT "past_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."past_projects"
    ADD CONSTRAINT "past_projects_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."project_links"
    ADD CONSTRAINT "project_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_links"
    ADD CONSTRAINT "project_links_project_id_link_id_key" UNIQUE ("project_id", "link_id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."statistics"
    ADD CONSTRAINT "statistics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_emails"
    ADD CONSTRAINT "user_emails_address_key" UNIQUE ("address");



ALTER TABLE ONLY "public"."user_emails"
    ADD CONSTRAINT "user_emails_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_groups"
    ADD CONSTRAINT "user_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_groups"
    ADD CONSTRAINT "user_groups_user_id_group_name_key" UNIQUE ("user_id", "group_name");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



CREATE INDEX "idx_addresses_city_state" ON "public"."addresses" USING "btree" ("city", "state");



CREATE INDEX "idx_comments_collection_object" ON "public"."comments" USING "btree" ("collection_name", "object_id");



CREATE INDEX "idx_comments_object_id" ON "public"."comments" USING "btree" ("object_id");



CREATE INDEX "idx_comments_parent" ON "public"."comments" USING "btree" ("parent_comment_id");



CREATE INDEX "idx_comments_user_id" ON "public"."comments" USING "btree" ("user_id");



CREATE INDEX "idx_contact_addresses_contact_id" ON "public"."contact_addresses" USING "btree" ("contact_id");



CREATE INDEX "idx_contact_links_contact_id" ON "public"."contact_links" USING "btree" ("contact_id");



CREATE INDEX "idx_contact_past_projects_contact_id" ON "public"."contact_past_projects" USING "btree" ("contact_id");



CREATE INDEX "idx_contact_projects_contact_id" ON "public"."contact_projects" USING "btree" ("contact_id");



CREATE INDEX "idx_contact_projects_project_id" ON "public"."contact_projects" USING "btree" ("project_id");



CREATE INDEX "idx_contacts_display_name" ON "public"."contacts" USING "btree" ("display_name");



CREATE INDEX "idx_contacts_slug" ON "public"."contacts" USING "btree" ("slug");



CREATE INDEX "idx_contacts_user_id" ON "public"."contacts" USING "btree" ("user_id");



CREATE INDEX "idx_links_platform" ON "public"."links" USING "btree" ("platform_name");



CREATE INDEX "idx_office_addresses_office_id" ON "public"."office_addresses" USING "btree" ("office_id");



CREATE INDEX "idx_office_contacts_contact_id" ON "public"."office_contacts" USING "btree" ("contact_id");



CREATE INDEX "idx_office_contacts_office_id" ON "public"."office_contacts" USING "btree" ("office_id");



CREATE INDEX "idx_office_links_office_id" ON "public"."office_links" USING "btree" ("office_id");



CREATE INDEX "idx_office_past_projects_office_id" ON "public"."office_past_projects" USING "btree" ("office_id");



CREATE INDEX "idx_office_phones_office_id" ON "public"."office_phones" USING "btree" ("office_id");



CREATE INDEX "idx_office_projects_office_id" ON "public"."office_projects" USING "btree" ("office_id");



CREATE INDEX "idx_office_projects_project_id" ON "public"."office_projects" USING "btree" ("project_id");



CREATE INDEX "idx_offices_slug" ON "public"."offices" USING "btree" ("slug");



CREATE INDEX "idx_offices_user_id" ON "public"."offices" USING "btree" ("user_id");



CREATE INDEX "idx_past_project_links_project_id" ON "public"."past_project_links" USING "btree" ("project_id");



CREATE INDEX "idx_past_projects_slug" ON "public"."past_projects" USING "btree" ("slug");



CREATE INDEX "idx_past_projects_user_id" ON "public"."past_projects" USING "btree" ("user_id");



CREATE INDEX "idx_project_links_project_id" ON "public"."project_links" USING "btree" ("project_id");



CREATE INDEX "idx_projects_project_title" ON "public"."projects" USING "btree" ("project_title");



CREATE INDEX "idx_projects_slug" ON "public"."projects" USING "btree" ("slug");



CREATE INDEX "idx_projects_status" ON "public"."projects" USING "btree" ("status");



CREATE INDEX "idx_projects_user_id" ON "public"."projects" USING "btree" ("user_id");



CREATE INDEX "idx_user_emails_address" ON "public"."user_emails" USING "btree" ("address");



CREATE INDEX "idx_user_emails_user_id" ON "public"."user_emails" USING "btree" ("user_id");



CREATE INDEX "idx_user_groups_name" ON "public"."user_groups" USING "btree" ("group_name");



CREATE INDEX "idx_user_groups_user_id" ON "public"."user_groups" USING "btree" ("user_id");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_slug" ON "public"."users" USING "btree" ("slug");



CREATE INDEX "idx_users_username" ON "public"."users" USING "btree" ("username");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_top_level_comment_id_fkey" FOREIGN KEY ("top_level_comment_id") REFERENCES "public"."comments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."contact_addresses"
    ADD CONSTRAINT "contact_addresses_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contact_addresses"
    ADD CONSTRAINT "contact_addresses_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contact_links"
    ADD CONSTRAINT "contact_links_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contact_links"
    ADD CONSTRAINT "contact_links_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contact_past_projects"
    ADD CONSTRAINT "contact_past_projects_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contact_past_projects"
    ADD CONSTRAINT "contact_past_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."past_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contact_projects"
    ADD CONSTRAINT "contact_projects_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contact_projects"
    ADD CONSTRAINT "contact_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."office_addresses"
    ADD CONSTRAINT "office_addresses_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."office_addresses"
    ADD CONSTRAINT "office_addresses_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."office_contacts"
    ADD CONSTRAINT "office_contacts_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."office_contacts"
    ADD CONSTRAINT "office_contacts_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."office_links"
    ADD CONSTRAINT "office_links_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."office_links"
    ADD CONSTRAINT "office_links_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."office_past_projects"
    ADD CONSTRAINT "office_past_projects_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."office_past_projects"
    ADD CONSTRAINT "office_past_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."past_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."office_phones"
    ADD CONSTRAINT "office_phones_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."office_projects"
    ADD CONSTRAINT "office_projects_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."office_projects"
    ADD CONSTRAINT "office_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."offices"
    ADD CONSTRAINT "offices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."past_project_links"
    ADD CONSTRAINT "past_project_links_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."past_project_links"
    ADD CONSTRAINT "past_project_links_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."past_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."past_projects"
    ADD CONSTRAINT "past_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."project_links"
    ADD CONSTRAINT "project_links_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_links"
    ADD CONSTRAINT "project_links_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."user_emails"
    ADD CONSTRAINT "user_emails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_groups"
    ADD CONSTRAINT "user_groups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "public"."addresses" TO "anon";
GRANT ALL ON TABLE "public"."addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."addresses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."addresses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."addresses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."addresses_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."contact_addresses" TO "anon";
GRANT ALL ON TABLE "public"."contact_addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_addresses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."contact_addresses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."contact_addresses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."contact_addresses_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."contact_links" TO "anon";
GRANT ALL ON TABLE "public"."contact_links" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_links" TO "service_role";



GRANT ALL ON SEQUENCE "public"."contact_links_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."contact_links_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."contact_links_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."contact_past_projects" TO "anon";
GRANT ALL ON TABLE "public"."contact_past_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_past_projects" TO "service_role";



GRANT ALL ON SEQUENCE "public"."contact_past_projects_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."contact_past_projects_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."contact_past_projects_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."contact_projects" TO "anon";
GRANT ALL ON TABLE "public"."contact_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_projects" TO "service_role";



GRANT ALL ON SEQUENCE "public"."contact_projects_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."contact_projects_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."contact_projects_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."contacts" TO "anon";
GRANT ALL ON TABLE "public"."contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."contacts" TO "service_role";



GRANT ALL ON TABLE "public"."links" TO "anon";
GRANT ALL ON TABLE "public"."links" TO "authenticated";
GRANT ALL ON TABLE "public"."links" TO "service_role";



GRANT ALL ON SEQUENCE "public"."links_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."links_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."links_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."office_addresses" TO "anon";
GRANT ALL ON TABLE "public"."office_addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."office_addresses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."office_addresses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."office_addresses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."office_addresses_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."office_contacts" TO "anon";
GRANT ALL ON TABLE "public"."office_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."office_contacts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."office_contacts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."office_contacts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."office_contacts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."office_links" TO "anon";
GRANT ALL ON TABLE "public"."office_links" TO "authenticated";
GRANT ALL ON TABLE "public"."office_links" TO "service_role";



GRANT ALL ON SEQUENCE "public"."office_links_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."office_links_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."office_links_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."office_past_projects" TO "anon";
GRANT ALL ON TABLE "public"."office_past_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."office_past_projects" TO "service_role";



GRANT ALL ON SEQUENCE "public"."office_past_projects_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."office_past_projects_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."office_past_projects_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."office_phones" TO "anon";
GRANT ALL ON TABLE "public"."office_phones" TO "authenticated";
GRANT ALL ON TABLE "public"."office_phones" TO "service_role";



GRANT ALL ON SEQUENCE "public"."office_phones_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."office_phones_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."office_phones_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."office_projects" TO "anon";
GRANT ALL ON TABLE "public"."office_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."office_projects" TO "service_role";



GRANT ALL ON SEQUENCE "public"."office_projects_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."office_projects_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."office_projects_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."offices" TO "anon";
GRANT ALL ON TABLE "public"."offices" TO "authenticated";
GRANT ALL ON TABLE "public"."offices" TO "service_role";



GRANT ALL ON TABLE "public"."past_project_links" TO "anon";
GRANT ALL ON TABLE "public"."past_project_links" TO "authenticated";
GRANT ALL ON TABLE "public"."past_project_links" TO "service_role";



GRANT ALL ON SEQUENCE "public"."past_project_links_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."past_project_links_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."past_project_links_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."past_projects" TO "anon";
GRANT ALL ON TABLE "public"."past_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."past_projects" TO "service_role";



GRANT ALL ON TABLE "public"."project_links" TO "anon";
GRANT ALL ON TABLE "public"."project_links" TO "authenticated";
GRANT ALL ON TABLE "public"."project_links" TO "service_role";



GRANT ALL ON SEQUENCE "public"."project_links_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."project_links_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."project_links_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."statistics" TO "anon";
GRANT ALL ON TABLE "public"."statistics" TO "authenticated";
GRANT ALL ON TABLE "public"."statistics" TO "service_role";



GRANT ALL ON TABLE "public"."user_emails" TO "anon";
GRANT ALL ON TABLE "public"."user_emails" TO "authenticated";
GRANT ALL ON TABLE "public"."user_emails" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_emails_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_emails_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_emails_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_groups" TO "anon";
GRANT ALL ON TABLE "public"."user_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."user_groups" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_groups_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_groups_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_groups_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_preferences" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_preferences_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_preferences_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_preferences_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































