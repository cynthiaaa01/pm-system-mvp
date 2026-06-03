const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  // get any project id
  const { data: projects } = await supabase.from('projects').select('id').limit(1);
  if (!projects || projects.length === 0) {
    console.log("No projects found");
    return;
  }
  const id = projects[0].id;
  console.log("Testing with Project ID:", id);

  const { data, error } = await supabase
    .from("projects")
    .select("*, clients(*), proposals(title, proposal_number, parsed_items), operations:operations_id(full_name), marketing:marketing_id(full_name)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("ERROR FETCHING:", error);
  } else {
    console.log("SUCCESS");
  }
}

run();
