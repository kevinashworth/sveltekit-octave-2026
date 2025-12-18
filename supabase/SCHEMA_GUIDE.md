# Supabase SQL Schema for Octave Casting Database

## Overview

This schema normalizes the MongoDB export data into a relational PostgreSQL database optimized for casting, offices, contacts, projects, and user management.

## Key Design Decisions

### 1. **ID Handling**

- **Users, Offices, Contacts, Projects**: TEXT PRIMARY KEY (preserving MongoDB ObjectIds)
- **Auto-increment tables**: BIGSERIAL (addresses, links, junction tables, etc.)
- Benefits: Preserves original IDs for easy mapping during migration, auto-IDs for junction tables

### 2. **Many-to-Many Relationships**

Instead of denormalized arrays, we use junction tables:

- `office_addresses` → One office can have multiple addresses
- `office_contacts` → Offices work with multiple contacts
- `office_projects` → Offices cast for multiple projects
- `contact_projects` → Contacts work on multiple projects with specialized roles

### 3. **Shared Resources**

- **addresses**: Reusable across offices and contacts (many-to-many)
- **links**: Shared links table referenced by offices, contacts, and projects
- **users**: Central user table for authentication and ownership

### 4. **Flexible Data**

- `auth_methods` JSONB: Stores authentication metadata (github, password flags)
- Allows expansion without schema changes

### 5. **Timestamps**

- All `created_at` use `TIMESTAMPTZ` (timezone-aware)
- Converted from MongoDB `{$date: "..."}` format during migration

### 6. **Constraints**

- Email format validation at DB level
- Foreign keys with CASCADE deletes (clean up related records)
- UNIQUE constraints on slugs, emails
- CHECK constraints for valid enum values

---

## Table Structure

### Core Entities

#### **users**

- Authentication and user profile management
- `is_admin`: Permission level
- `auth_methods`: JSON storing github, password, etc.
- Related: `user_emails`, `user_preferences`, `user_groups`

#### **offices**

```
MongoDB: {contacts: [{contactId, contactName, ...}], projects: [...]}
SQL: office → (office_contacts ← contacts), (office_projects ← projects)
```

#### **contacts**

```
MongoDB: {offices: [{officeId, ...}], projects: [{projectId, titleForProject, ...}]}
SQL: contacts → (office_contacts ← offices), (contact_projects ← projects)
```

#### **projects** / **past_projects**

- Separate tables for active vs archived projects
- Same fields, allows different lifecycle management
- Referenced by offices and contacts via junction tables

#### **comments**

- Supports polymorphic references via `collection_name` + `object_id`
- Threaded: `parent_comment_id` and `top_level_comment_id` for nested replies
- Works with Projects, Offices, Contacts, PastProjects

### Resource Tables

#### **addresses**

- Shared resource for offices and contacts
- Fields: street1, street2, city, state, zip, address_type, location
- Many-to-many via `office_addresses` and `contact_addresses`

#### **links**

- Shared social/web links
- Fields: platform_name, profile_name, profile_link
- Many-to-many via `office_links`, `contact_links`, `project_links`

### Junction Tables (Many-to-Many)

- `office_addresses`: Office → Address (1:many)
- `office_contacts`: Office ↔ Contact (many:many)
- `office_projects`: Office ↔ Project (many:many)
- `contact_projects`: Contact ↔ Project (many:many, with `title_for_project`)
- Plus variants for phones, links, past projects

### User Settings

- `user_emails`: Multiple email addresses per user
- `user_preferences`: Notification preferences
- `user_groups`: Groups/roles (participants, admins, etc)

---

## Data Normalization Example

**MongoDB (denormalized):**

```json
{
	"_id": "office123",
	"displayName": "Simon Casting",
	"contacts": [
		{ "contactId": "contact1", "contactName": "Sarah", "contactTitle": "Casting Director" },
		{ "contactId": "contact2", "contactName": "John", "contactTitle": "Associate" }
	],
	"addresses": [{ "street1": "123 Main", "city": "LA", "state": "CA" }]
}
```

**PostgreSQL (normalized):**

```sql
-- Main record
INSERT INTO offices (id, display_name, slug, user_id, ...)
VALUES ('office123', 'Simon Casting', 'simon-casting', 'user1', ...);

-- Address (reused across offices/contacts)
INSERT INTO addresses (street1, city, state, ...)
VALUES ('123 Main', 'LA', 'CA', ...);

-- Link office to address
INSERT INTO office_addresses (office_id, address_id)
VALUES ('office123', 1);

-- Link office to contacts (no denormalized data)
INSERT INTO office_contacts (office_id, contact_id)
VALUES ('office123', 'contact1');
INSERT INTO office_contacts (office_id, contact_id)
VALUES ('office123', 'contact2');

-- Query contact details when needed
SELECT c.* FROM contacts c
JOIN office_contacts oc ON c.id = oc.contact_id
WHERE oc.office_id = 'office123';
```

---

## Indexes for Performance

Key indexes created for common queries:

- **Users**: by email, username, slug
- **Offices/Contacts/Projects**: by user_id, slug, created_at (implicit)
- **Comments**: by object_id, collection_name, user_id, parent_id
- **Junction tables**: on both foreign keys for efficient joins
- **Addresses/Links**: for deduplication queries

---

## Migration Path from MongoDB

The migration script will:

1. **Users** → INSERT into users + user_emails + user_groups + user_preferences
2. **Addresses** → Deduplicate and INSERT into addresses
3. **Links** → Deduplicate and INSERT into links
4. **Offices** →
   - INSERT into offices
   - INSERT into office_addresses (resolve denormalized addresses)
   - INSERT into office_phones
   - INSERT into office_links
   - INSERT into office_contacts (extract just IDs)
   - INSERT into office_projects (extract just IDs)
5. **Contacts** → Similar to offices
6. **Projects/PastProjects** → INSERT with all fields, link via junction tables
7. **Comments** → INSERT preserving collection_name and object_id references

---

## Usage Notes

### Foreign Key Constraints

- `ON DELETE CASCADE`: Deleting a user deletes their offices, contacts, projects, comments
- `ON DELETE SET NULL`: Deleting a comment doesn't delete replies; parent_comment_id becomes null
- Consider archiving instead of deleting for important records

### Polymorphic Comments

```sql
-- Find all comments on a specific project
SELECT * FROM comments
WHERE collection_name = 'Projects' AND object_id = 'project123'
ORDER BY created_at DESC;

-- Find nested replies to a comment
SELECT * FROM comments
WHERE parent_comment_id = 'comment123'
ORDER BY created_at ASC;
```

### Querying Relationships

```sql
-- Offices for a contact
SELECT o.* FROM offices o
JOIN office_contacts oc ON o.id = oc.office_id
WHERE oc.contact_id = 'contact123';

-- All addresses for an office
SELECT a.* FROM addresses a
JOIN office_addresses oa ON a.id = oa.address_id
WHERE oa.office_id = 'office123';

-- Projects with their contacts and offices
SELECT p.*,
       JSON_AGG(DISTINCT c.*) as contacts,
       JSON_AGG(DISTINCT o.*) as offices
FROM projects p
LEFT JOIN contact_projects cp ON p.id = cp.project_id
LEFT JOIN contacts c ON cp.contact_id = c.id
LEFT JOIN office_projects op ON p.id = op.project_id
LEFT JOIN offices o ON op.office_id = o.id
WHERE p.id = 'project123'
GROUP BY p.id;
```

---

## Next Steps

1. Create project in Supabase dashboard
2. Copy this SQL into Supabase SQL editor → "Run"
3. Verify tables created in Table Editor
4. Run the migration script (we'll create this next)
5. Verify data integrity and relationships

---

## PostgreSQL Compatibility

This schema uses standard PostgreSQL 12+ features:

- TIMESTAMPTZ, TEXT, BOOLEAN, JSONB
- Foreign keys with ON DELETE CASCADE
- CHECK constraints
- UNIQUE constraints
- Indexes (BTREE, implicit)
- Extensions: uuid-ossp (optional, for future use)

All compatible with Supabase's managed PostgreSQL.
