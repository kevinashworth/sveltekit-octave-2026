import { createClient } from '@supabase/supabase-js';

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || '';
// const SUPABASE_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

console.log('Supabase URL:', PUBLIC_SUPABASE_URL); // Debugging line
console.log('Supabase Key:', PUBLIC_SUPABASE_ANON_KEY ? 'Exists' : 'Missing'); // Debugging line

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
