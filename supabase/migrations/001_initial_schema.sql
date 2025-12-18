-- Create tables for the Octave casting database
-- This migration creates the normalized schema from the MongoDB data

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  email_hash TEXT,
  is_admin BOOLEAN DEFAULT false,
  locale TEXT DEFAULT 'en',
  bio TEXT,
  html_bio TEXT,
  website TEXT,
  twitter_username TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ,

  -- Authentication metadata (JSON for flexibility)
  auth_methods JSONB, -- stores github, password flags

  CONSTRAINT email_format CHECK (email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_slug ON users(slug);

-- ============================================
-- ADDRESSES TABLE
-- ============================================
CREATE TABLE addresses (
  id BIGSERIAL PRIMARY KEY,
  street1 TEXT,
  street2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT,
  address_type TEXT, -- 'office', 'home', etc
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_address CHECK (city IS NOT NULL AND state IS NOT NULL)
);

CREATE INDEX idx_addresses_city_state ON addresses(city, state);

-- ============================================
-- LINKS TABLE (social media, websites, etc)
-- ============================================
CREATE TABLE links (
  id BIGSERIAL PRIMARY KEY,
  platform_name TEXT NOT NULL,
  profile_name TEXT NOT NULL,
  profile_link TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_links_platform ON links(platform_name);

-- ============================================
-- OFFICES TABLE
-- ============================================
CREATE TABLE offices (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  body TEXT,
  html_body TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_offices_user_id ON offices(user_id);
CREATE INDEX idx_offices_slug ON offices(slug);

-- ============================================
-- OFFICE_ADDRESSES (many-to-many)
-- ============================================
CREATE TABLE office_addresses (
  id BIGSERIAL PRIMARY KEY,
  office_id TEXT NOT NULL,
  address_id BIGINT NOT NULL,

  FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE CASCADE,
  FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE CASCADE,
  UNIQUE(office_id, address_id)
);

CREATE INDEX idx_office_addresses_office_id ON office_addresses(office_id);

-- ============================================
-- OFFICE_PHONES TABLE
-- ============================================
CREATE TABLE office_phones (
  id BIGSERIAL PRIMARY KEY,
  office_id TEXT NOT NULL,
  phone_number_as_input TEXT,
  phone_number_type TEXT,
  phone_number TEXT,
  national_format TEXT,
  country_code TEXT,

  FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE CASCADE
);

CREATE INDEX idx_office_phones_office_id ON office_phones(office_id);

-- ============================================
-- OFFICE_LINKS (many-to-many)
-- ============================================
CREATE TABLE office_links (
  id BIGSERIAL PRIMARY KEY,
  office_id TEXT NOT NULL,
  link_id BIGINT NOT NULL,

  FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE CASCADE,
  FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE,
  UNIQUE(office_id, link_id)
);

CREATE INDEX idx_office_links_office_id ON office_links(office_id);

-- ============================================
-- CONTACTS TABLE
-- ============================================
CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  title TEXT,
  gender TEXT,
  slug TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  the_address TEXT,
  address_string TEXT,
  body TEXT,
  html_body TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_slug ON contacts(slug);
CREATE INDEX idx_contacts_display_name ON contacts(display_name);

-- ============================================
-- CONTACT_ADDRESSES (many-to-many)
-- ============================================
CREATE TABLE contact_addresses (
  id BIGSERIAL PRIMARY KEY,
  contact_id TEXT NOT NULL,
  address_id BIGINT NOT NULL,

  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE CASCADE,
  UNIQUE(contact_id, address_id)
);

CREATE INDEX idx_contact_addresses_contact_id ON contact_addresses(contact_id);

-- ============================================
-- CONTACT_LINKS (many-to-many)
-- ============================================
CREATE TABLE contact_links (
  id BIGSERIAL PRIMARY KEY,
  contact_id TEXT NOT NULL,
  link_id BIGINT NOT NULL,

  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE,
  UNIQUE(contact_id, link_id)
);

CREATE INDEX idx_contact_links_contact_id ON contact_links(contact_id);

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  project_title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  project_type TEXT,
  "union" TEXT,
  network TEXT,
  status TEXT,
  platform_type TEXT,
  website TEXT,
  season TEXT,
  "order" TEXT,
  renewed BOOLEAN,
  shooting_location TEXT,
  summary TEXT,
  html_summary TEXT,
  notes TEXT,
  html_notes TEXT,
  casting_company TEXT,
  sort_title TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_project_title ON projects(project_title);
CREATE INDEX idx_projects_status ON projects(status);

-- ============================================
-- PAST_PROJECTS TABLE
-- ============================================
CREATE TABLE past_projects (
  id TEXT PRIMARY KEY,
  project_title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  project_type TEXT,
  "union" TEXT,
  network TEXT,
  status TEXT,
  platform_type TEXT,
  website TEXT,
  season TEXT,
  "order" TEXT,
  renewed BOOLEAN,
  shooting_location TEXT,
  summary TEXT,
  html_summary TEXT,
  notes TEXT,
  html_notes TEXT,
  casting_company TEXT,
  sort_title TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_past_projects_user_id ON past_projects(user_id);
CREATE INDEX idx_past_projects_slug ON past_projects(slug);

-- ============================================
-- PROJECT_LINKS (many-to-many)
-- ============================================
CREATE TABLE project_links (
  id BIGSERIAL PRIMARY KEY,
  project_id TEXT NOT NULL,
  link_id BIGINT NOT NULL,

  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE,
  UNIQUE(project_id, link_id)
);

CREATE INDEX idx_project_links_project_id ON project_links(project_id);

-- ============================================
-- PAST_PROJECT_LINKS (many-to-many)
-- ============================================
CREATE TABLE past_project_links (
  id BIGSERIAL PRIMARY KEY,
  project_id TEXT NOT NULL,
  link_id BIGINT NOT NULL,

  FOREIGN KEY (project_id) REFERENCES past_projects(id) ON DELETE CASCADE,
  FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE,
  UNIQUE(project_id, link_id)
);

CREATE INDEX idx_past_project_links_project_id ON past_project_links(project_id);

-- ============================================
-- OFFICE_CONTACTS (many-to-many)
-- ============================================
CREATE TABLE office_contacts (
  id BIGSERIAL PRIMARY KEY,
  office_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,

  FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  UNIQUE(office_id, contact_id)
);

CREATE INDEX idx_office_contacts_office_id ON office_contacts(office_id);
CREATE INDEX idx_office_contacts_contact_id ON office_contacts(contact_id);

-- ============================================
-- OFFICE_PROJECTS (many-to-many)
-- ============================================
CREATE TABLE office_projects (
  id BIGSERIAL PRIMARY KEY,
  office_id TEXT NOT NULL,
  project_id TEXT NOT NULL,

  FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE(office_id, project_id)
);

CREATE INDEX idx_office_projects_office_id ON office_projects(office_id);
CREATE INDEX idx_office_projects_project_id ON office_projects(project_id);

-- ============================================
-- OFFICE_PAST_PROJECTS (many-to-many)
-- ============================================
CREATE TABLE office_past_projects (
  id BIGSERIAL PRIMARY KEY,
  office_id TEXT NOT NULL,
  project_id TEXT NOT NULL,

  FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES past_projects(id) ON DELETE CASCADE,
  UNIQUE(office_id, project_id)
);

CREATE INDEX idx_office_past_projects_office_id ON office_past_projects(office_id);

-- ============================================
-- CONTACT_PROJECTS (many-to-many)
-- ============================================
CREATE TABLE contact_projects (
  id BIGSERIAL PRIMARY KEY,
  contact_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  title_for_project TEXT, -- specialized role/title on this project

  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE(contact_id, project_id)
);

CREATE INDEX idx_contact_projects_contact_id ON contact_projects(contact_id);
CREATE INDEX idx_contact_projects_project_id ON contact_projects(project_id);

-- ============================================
-- CONTACT_PAST_PROJECTS (many-to-many)
-- ============================================
CREATE TABLE contact_past_projects (
  id BIGSERIAL PRIMARY KEY,
  contact_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  title_for_project TEXT,

  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES past_projects(id) ON DELETE CASCADE,
  UNIQUE(contact_id, project_id)
);

CREATE INDEX idx_contact_past_projects_contact_id ON contact_past_projects(contact_id);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  body TEXT NOT NULL,
  html_body TEXT,
  collection_name TEXT NOT NULL, -- 'Projects', 'Offices', 'Contacts', 'PastProjects'
  object_id TEXT NOT NULL, -- ID of the entity being commented on
  user_id TEXT NOT NULL,
  parent_comment_id TEXT,
  top_level_comment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  posted_at TIMESTAMPTZ,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE SET NULL,
  FOREIGN KEY (top_level_comment_id) REFERENCES comments(id) ON DELETE SET NULL,
  CONSTRAINT valid_collection CHECK (collection_name IN ('Projects', 'Offices', 'Contacts', 'PastProjects'))
);

CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_object_id ON comments(object_id);
CREATE INDEX idx_comments_collection_object ON comments(collection_name, object_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);

-- ============================================
-- STATISTICS TABLE (if needed for future use)
-- ============================================
CREATE TABLE statistics (
  id TEXT PRIMARY KEY,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Create groups table for user roles
-- ============================================
CREATE TABLE user_groups (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  group_name TEXT NOT NULL, -- 'participants', 'admins', etc

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, group_name)
);

CREATE INDEX idx_user_groups_user_id ON user_groups(user_id);
CREATE INDEX idx_user_groups_name ON user_groups(group_name);

-- ============================================
-- Create user preferences/settings table
-- ============================================
CREATE TABLE user_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  notifications_comments BOOLEAN DEFAULT true,
  notifications_posts BOOLEAN DEFAULT true,
  notifications_replies BOOLEAN DEFAULT true,
  notifications_users BOOLEAN DEFAULT false,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- Create user emails table for multiple emails
-- ============================================
CREATE TABLE user_emails (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  address TEXT UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT email_format CHECK (address ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_user_emails_user_id ON user_emails(user_id);
CREATE INDEX idx_user_emails_address ON user_emails(address);

-- Enable UUID extension if needed for future improvements
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
