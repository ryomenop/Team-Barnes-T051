const { Client } = require('pg');

async function sync() {
  const client = new Client({
    host: 'aws-0-ap-northeast-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.qejxlvizrfbzjajbjqtx',
    password: '@Ryomen0PYT',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  // Create an automatic trigger on auth.users so that ANY user created in auth.users
  // automatically gets a profile record in public.profiles!
  await client.query(`
    CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (
        id,
        name,
        email,
        phone,
        student_id_or_employee_id,
        department,
        role,
        requested_role,
        status,
        is_otp_verified,
        created_at,
        updated_at
      )
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'studentId', 'N/A'),
        COALESCE(NEW.raw_user_meta_data->>'department', 'General Academic'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'Student'),
        COALESCE(NEW.raw_user_meta_data->>'requestedRole', COALESCE(NEW.raw_user_meta_data->>'role', 'Student')),
        CASE WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'Student') = 'Student' THEN 'APPROVED' ELSE 'PENDING_APPROVAL' END,
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, profiles.name),
        email = EXCLUDED.email,
        updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();
  `);
  console.log('Trigger on_auth_user_created created successfully!');

  // Sync Shubham and any existing users into profiles
  await client.query(`
    INSERT INTO public.profiles (id, name, email, phone, student_id_or_employee_id, department, role, requested_role, status, is_otp_verified, created_at, updated_at)
    SELECT 
      u.id,
      COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
      u.email,
      COALESCE(u.raw_user_meta_data->>'phone', ''),
      COALESCE(u.raw_user_meta_data->>'studentId', '12601402'),
      COALESCE(u.raw_user_meta_data->>'department', 'Computer Science & Engineering'),
      COALESCE(u.raw_user_meta_data->>'role', 'Student'),
      COALESCE(u.raw_user_meta_data->>'requestedRole', 'Student'),
      'APPROVED',
      true,
      NOW(),
      NOW()
    FROM auth.users u
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log('Existing auth.users synced into public.profiles!');

  const check = await client.query(`SELECT id, name, email, role, status FROM public.profiles;`);
  console.log('Current profiles:', check.rows);

  await client.end();
}

sync().catch(console.error);
