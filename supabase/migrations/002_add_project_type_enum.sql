-- Create enum type for project_type
CREATE TYPE project_type AS ENUM (
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

-- Alter projects table to use the enum
ALTER TABLE projects
  ALTER COLUMN project_type TYPE project_type
  USING project_type::project_type;

-- Alter past_projects table to use the enum
ALTER TABLE past_projects
  ALTER COLUMN project_type TYPE project_type
  USING project_type::project_type;