# Supabase Migration Guide

This script migrates all your MongoDB export data into Supabase.

## Prerequisites

1. ✅ Supabase project created
2. ✅ SQL schema executed (001_initial_schema.sql)
3. Your import JSON files in the `import/` folder

## Setup Steps

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 2. Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Settings → API
3. Copy:
   - **Project URL** (SUPABASE_URL)
   - **Service Role Key** (SUPABASE_KEY) - Use this, not anon key!

### 3. Create `.env.local` File

In your project root, create `.env.local`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-secret-key
```

⚠️ **Important**: Use the **Service Role Key**, not the anonymous key. The service role key has full database access needed for the migration.

### 4. Run the Migration

```bash
# Using Node (if script is .js)
node scripts/migrate-to-supabase.js

# Using tsx for TypeScript
npx tsx scripts/migrate-to-supabase.ts
```

If you get a module error, convert the script to CommonJS:

```bash
mv scripts/migrate-to-supabase.ts scripts/migrate-to-supabase.js
```

Then update the imports at the top to CommonJS:

```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
```

## What the Script Does

1. **Users** → Inserts users with emails, preferences, and groups
2. **Addresses & Links** → Deduplicates and inserts shared resources
3. **Offices** → Inserts offices with addresses, phones, and links
4. **Contacts** → Inserts contacts with addresses and links
5. **Projects** → Inserts active projects with links
6. **Past Projects** → Inserts archived projects with links
7. **Relationships** → Creates many-to-many junctions for:
   - office_contacts
   - office_projects
   - office_past_projects
   - contact_projects
   - contact_past_projects
8. **Comments** → Inserts comments with threading support
9. **Statistics** → Inserts any statistics data

## Expected Output

```
🚀 Starting migration from MongoDB JSON to Supabase...

📂 Loading data files...
✓ Loaded: 6 users, 196 offices, 477 contacts, 599 projects, 816 past projects, 106 comments

👥 Migrating users...
✓ Users migrated

📍 Migrating addresses and links...
✓ Addresses and links migrated

🏢 Migrating offices...
✓ Offices migrated

👤 Migrating contacts...
✓ Contacts migrated

🎬 Migrating projects...
✓ Projects migrated

📦 Migrating past projects...
✓ Past projects migrated

🔗 Creating relationships...
✓ Relationships created

💬 Migrating comments...
✓ Comments migrated

📊 Migrating statistics...
✓ Statistics migrated

✅ Migration completed successfully!
```

## Troubleshooting

### Error: "Failed to run sql query"

- Check that all tables were created successfully in Supabase
- Verify foreign key references exist

### Error: "insert or update on table violates foreign key constraint"

- This means a referenced entity doesn't exist
- Check migration order (users must come before offices, etc.)
- Verify IDs match between tables

### Error: "duplicate key value"

- Some records may already exist from a previous run
- Delete data from tables and retry, or check for duplicate IDs in source files

### "Cannot find module" Error

Make sure you're running from the project root directory and have run `npm install @supabase/supabase-js`.

## Post-Migration

Once complete:

1. **Verify data** in Supabase dashboard (Table Editor)
2. **Check row counts** match expected numbers
3. **Test queries** in SQL Editor:

   ```sql
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM offices;
   SELECT o.*, COUNT(oa.id) as address_count
   FROM offices o
   LEFT JOIN office_contacts oa ON o.id = oa.office_id
   GROUP BY o.id LIMIT 5;
   ```

4. **Back up your data**:
   ```bash
   # Export backup from Supabase dashboard
   # Settings → Backups → Download
   ```

## Updating Your App

After migration, you can use Supabase instead of JSON imports:

```typescript
import { supabase } from '$lib/supabase'; // Create this file

// Instead of: import { offices } from '$lib/data/offices.json'
const { data: offices, error } = await supabase
  .from('offices')
  .select('*, office_addresses(*, addresses(*)), office_contacts(*), office_projects(*)');
```

More information: [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
