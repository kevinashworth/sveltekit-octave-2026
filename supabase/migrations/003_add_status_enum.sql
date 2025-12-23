-- Create enum type for status
CREATE TYPE project_status AS ENUM (
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

-- Alter projects table to use the enum
ALTER TABLE projects
  ALTER COLUMN status TYPE project_status
  USING status::project_status;

-- Alter past_projects table to use the enum
ALTER TABLE past_projects
  ALTER COLUMN status TYPE project_status
  USING status::project_status;
