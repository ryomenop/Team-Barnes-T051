const { Client } = require('pg');

async function setup() {
  const client = new Client({
    host: 'aws-0-ap-northeast-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.qejxlvizrfbzjajbjqtx',
    password: '@Ryomen0PYT',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to PostgreSQL');

  // 1. Confirm any existing unconfirmed users
  await client.query(`UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;`);
  console.log('Confirmed all existing users in auth.users');

  // 2. Create trigger to automatically confirm every new user on signup!
  await client.query(`
    CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.email_confirmed_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    DROP TRIGGER IF EXISTS tr_auto_confirm_new_user ON auth.users;
    CREATE TRIGGER tr_auto_confirm_new_user
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_confirm_new_user();
  `);
  console.log('Auto-confirm trigger created on auth.users successfully!');

  // 3. Create or update profiles table with otp columns
  await client.query(`
    ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS otp_code TEXT;
    ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS is_otp_verified BOOLEAN DEFAULT false;
    ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
  `);
  console.log('Profiles table updated with OTP columns');

  await client.end();
}

setup().catch(console.error);
