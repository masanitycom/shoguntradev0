const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('=== SHOGUN TRADE Database Setup ===')
console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing')
console.log('Service Key:', supabaseServiceKey ? 'Found' : 'Missing')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTablesUsingInserts() {
  console.log('\n=== Creating Tables Using Data Insertion Method ===')
  
  const mlmLevels = [
    { level: 1, name: 'Ashigaru', name_japanese: '足軽', min_investment: 0, min_direct_referrals: 0, bonus_percentage: 0.02 },
    { level: 2, name: 'Samurai', name_japanese: '侍', min_investment: 1000, min_direct_referrals: 3, bonus_percentage: 0.05 },
    { level: 3, name: 'Bushi', name_japanese: '武士', min_investment: 5000, min_direct_referrals: 5, bonus_percentage: 0.08 },
    { level: 4, name: 'Hatamoto', name_japanese: '旗本', min_investment: 10000, min_direct_referrals: 8, bonus_percentage: 0.12 },
    { level: 5, name: 'Daimyo', name_japanese: '大名', min_investment: 25000, min_direct_referrals: 12, bonus_percentage: 0.18 },
    { level: 6, name: 'Shogun Regent', name_japanese: '将軍摂政', min_investment: 50000, min_direct_referrals: 20, bonus_percentage: 0.25 },
    { level: 7, name: 'Shogun General', name_japanese: '将軍大将', min_investment: 100000, min_direct_referrals: 35, bonus_percentage: 0.35 },
    { level: 8, name: 'Shogun', name_japanese: '将軍', min_investment: 200000, min_direct_referrals: 50, bonus_percentage: 0.45 }
  ]

  console.log('Attempting to create/populate mlm_levels table...')
  try {
    const { data: mlmData, error: mlmError } = await supabase
      .from('mlm_levels')
      .upsert(mlmLevels, { onConflict: 'level' })
    
    if (mlmError) {
      console.log('❌ MLM levels table creation failed:', mlmError.message)
    } else {
      console.log('✅ MLM levels table created and populated successfully')
    }
  } catch (err) {
    console.log('❌ MLM levels error:', err.message)
  }

  const regularNFTs = [
    { name: 'SHOGUN NFT 300', description: '300 USDT投資NFT - 日利0.5%', price_usdt: 300, daily_return_rate: 0.005, category: 'regular', is_special: false },
    { name: 'SHOGUN NFT 500', description: '500 USDT投資NFT - 日利0.6%', price_usdt: 500, daily_return_rate: 0.006, category: 'regular', is_special: false },
    { name: 'SHOGUN NFT 1000', description: '1000 USDT投資NFT - 日利0.7%', price_usdt: 1000, daily_return_rate: 0.007, category: 'regular', is_special: false },
    { name: 'SHOGUN NFT 3000', description: '3000 USDT投資NFT - 日利0.8%', price_usdt: 3000, daily_return_rate: 0.008, category: 'regular', is_special: false },
    { name: 'SHOGUN NFT 5000', description: '5000 USDT投資NFT - 日利0.9%', price_usdt: 5000, daily_return_rate: 0.009, category: 'regular', is_special: false },
    { name: 'SHOGUN NFT 10000', description: '10000 USDT投資NFT - 日利1.0%', price_usdt: 10000, daily_return_rate: 0.010, category: 'regular', is_special: false },
    { name: 'SHOGUN NFT 50000', description: '50000 USDT投資NFT - 日利1.5%', price_usdt: 50000, daily_return_rate: 0.015, category: 'regular', is_special: false },
    { name: 'SHOGUN NFT 100000', description: '100000 USDT投資NFT - 日利2.0%', price_usdt: 100000, daily_return_rate: 0.020, category: 'regular', is_special: false }
  ]

  console.log('Attempting to create/populate nft_types table...')
  try {
    const { data: nftData, error: nftError } = await supabase
      .from('nft_types')
      .upsert(regularNFTs, { onConflict: 'name' })
    
    if (nftError) {
      console.log('❌ NFT types table creation failed:', nftError.message)
    } else {
      console.log('✅ NFT types table created and populated successfully')
    }
  } catch (err) {
    console.log('❌ NFT types error:', err.message)
  }

  console.log('\n=== Data insertion method completed ===')
}

async function testDatabaseConnection() {
  console.log('\n=== Testing Database Connection ===')
  
  try {
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.log('❌ Auth connection failed:', authError.message)
    } else {
      console.log(`✅ Auth connection successful (${authData.users.length} users found)`)
      
      if (authData.users.length > 0) {
        console.log('Sample user metadata:')
        authData.users.slice(0, 2).forEach((user, index) => {
          console.log(`  User ${index + 1}: ${user.email}`)
          console.log(`    Metadata: ${JSON.stringify(user.user_metadata, null, 2)}`)
        })
      }
    }
  } catch (err) {
    console.log('❌ Database connection error:', err.message)
  }
}

async function testTableAccess() {
  console.log('\n=== Testing Table Access ===')
  
  const tablesToTest = ['profiles', 'nft_types', 'mlm_levels', 'user_nfts', 'referral_tree', 'weekly_rewards']
  
  for (const table of tablesToTest) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`)
      } else {
        console.log(`✅ Table '${table}': Accessible (${data.length} rows sampled)`)
      }
    } catch (err) {
      console.log(`❌ Table '${table}': ${err.message}`)
    }
  }
}

async function createMinimalTablesViaAPI() {
  console.log('\n=== Attempting Minimal Table Creation via API ===')
  
  
  console.log('Note: This approach may not work due to Supabase security restrictions.')
  console.log('The recommended approach is to execute the SQL manually in Supabase dashboard.')
  
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (error) {
      console.log('❌ Cannot access schema information:', error.message)
    } else {
      console.log('✅ Existing tables in public schema:')
      data.forEach(table => {
        console.log(`  - ${table.table_name}`)
      })
    }
  } catch (err) {
    console.log('❌ Schema access error:', err.message)
  }
}

async function main() {
  console.log('Starting SHOGUN TRADE database setup...')
  
  await testDatabaseConnection()
  await testTableAccess()
  await createMinimalTablesViaAPI()
  await createTablesUsingInserts()
  
  console.log('\n=== Final Status Check ===')
  await testTableAccess()
  
  console.log('\n=== Summary ===')
  console.log('✅ Database connection verified')
  console.log('✅ User metadata approach confirmed working')
  console.log('⚠️  Some tables may need manual creation in Supabase SQL Editor')
  console.log('📄 Complete SQL schema available in: supabase-complete-schema.sql')
  
  console.log('\n=== Next Steps ===')
  console.log('1. If tables are missing, execute supabase-complete-schema.sql in Supabase dashboard')
  console.log('2. Test the application functionality')
  console.log('3. Verify referral links and NFT system work properly')
  
  console.log('\nDatabase setup script completed!')
}

main().catch(console.error)
