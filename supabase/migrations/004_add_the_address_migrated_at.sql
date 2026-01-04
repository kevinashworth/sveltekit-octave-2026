-- Add a timestamp to mark which contacts have been migrated from the_address into addresses
BEGIN;

ALTER TABLE public.contacts
	ADD COLUMN IF NOT EXISTS the_address_migrated_at timestamptz NULL;

COMMIT;
