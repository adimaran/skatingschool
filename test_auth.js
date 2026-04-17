import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase keys in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('--- TESTING ADMIN ACCOUNT ---');
  const { data: adminData, error: adminError } = await supabase.auth.signInWithPassword({
    email: 'admin@admin.com',
    password: 'south',
  });
  if (adminError) {
    console.log('Admin login failed:', adminError.message);
  } else {
    console.log('Admin login SUCCESS:', adminData.user.id);
  }

  console.log('\n--- TESTING ADITYA ACCOUNT (add kid) ---');
  // We can't log in without password, but we can just use service_role if available. Since it's anon key, we will ask user for password? 
  // No, let's just attempt a raw insert into kids and class_enrollments to see if RLS is the blocker! Wait, without a user session, RLS will block it immediately. 
  
  console.log('\n--- TESTING DB STRUCTURE ---');
  // Ensure the tables exist
  const { data: kidsData, error: kidsError } = await supabase.from('kids').select('*').limit(1);
  if (kidsError) console.log('Kids table fetch error:', kidsError.message);
  else console.log('Kids table exists and readable.');

  const { data: enrollData, error: enrollError } = await supabase.from('class_enrollments').select('*').limit(1);
  if (enrollError) console.log('class_enrollments table fetch error:', enrollError.message);
  else console.log('class_enrollments table exists and readable.');
}

testAuth();
