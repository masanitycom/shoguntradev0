const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://xkgdzmxltnnclvnrpylo.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZ2R6bXhsdG5uY2x2bnJweWxvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDI2NDg3MCwiZXhwIjoyMDY1ODQwODcwfQ.SbC_vwidkvR6xVJgQqF6Ga2M9FxYWjg7VublyfWNRag'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('Setting up database tables...')
  
  try {
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          full_name TEXT NOT NULL,
          full_name_kana TEXT NOT NULL,
          usdt_address TEXT NOT NULL,
          wallet_type TEXT NOT NULL DEFAULT 'TRC20',
          referrer_id TEXT REFERENCES profiles(user_id),
          mlm_level INTEGER DEFAULT 1,
          total_investment DECIMAL(15,2) DEFAULT 0,
          total_earnings DECIMAL(15,2) DEFAULT 0,
          direct_referrals INTEGER DEFAULT 0,
          indirect_referrals INTEGER DEFAULT 0,
          is_admin BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (profilesError) {
      console.error('Error creating profiles table:', profilesError)
    } else {
      console.log('✓ Profiles table created')
    }

    console.log('Database setup completed!')
    
  } catch (error) {
    console.error('Database setup failed:', error)
  }
}

setupDatabase()
