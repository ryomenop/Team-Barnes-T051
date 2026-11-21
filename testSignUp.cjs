const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qejxlvizrfbzjajbjqtx.supabase.co';
const supabaseKey = 'sb_publishable_2NZjMO7T8qfkbM6SodGUgQ_rXSRCl9j';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing signUp with email and password...');
  const res = await supabase.auth.signUp({
    email: 'test_student_direct_' + Date.now() + '@campus.edu',
    password: 'Password123!',
    options: {
      data: {
        name: 'Test Direct Student',
        role: 'Student',
        studentId: 'TEST-001',
        department: 'Computer Science'
      }
    }
  });
  console.log('SignUp result:', JSON.stringify(res, null, 2));
}

test().catch(console.error);
