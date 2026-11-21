const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qejxlvizrfbzjajbjqtx.supabase.co';
const supabaseKey = 'sb_publishable_2NZjMO7T8qfkbM6SodGUgQ_rXSRCl9j';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing signInWithOtp...');
  const res = await supabase.auth.signInWithOtp({
    email: 'shubham12jha@gmail.com',
    options: {
      shouldCreateUser: false
    }
  });
  console.log('Result:', JSON.stringify(res, null, 2));
}

test().catch(console.error);
