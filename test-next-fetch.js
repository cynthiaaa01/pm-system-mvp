const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const http = require('http');

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.TEST_EMAIL,
    password: process.env.TEST_PASSWORD
  });

  if (authError || !authData.user) {
    console.error("登入失敗");
    return;
  }

  const { data: projects } = await supabase.from('projects').select('id').limit(1);
  if (!projects || projects.length === 0) {
    console.log("No projects found after login");
    return;
  }
  const id = projects[0].id;
  console.log("Testing with Project ID:", id);

  // We need to fetch the next.js server as the authenticated user.
  // Next.js uses cookies for auth. Let's get the session cookie.
  const session = authData.session;
  
  // Actually, we don't need to do a full cookie fetch if we just want to see if the page crashes or returns 404.
  // If it's RLS, it might return 404 because `getProject` throws an error or returns null.
  // Let's just run curl and check the response.
  
  const { execSync } = require('child_process');
  try {
    const output = execSync(`curl -I -s http://localhost:3000/dashboard/projects/${id}`).toString();
    console.log(output);
  } catch (e) {
    console.error(e);
  }
}

run();
