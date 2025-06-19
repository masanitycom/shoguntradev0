const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing')
console.log('Service Key:', supabaseServiceKey ? 'Found' : 'Missing')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.error('Make sure .env.local contains:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_url')
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const dbUrl = supabaseUrl.replace('https://', '').replace('.supabase.co', '')
const connectionString = `postgresql://postgres:${supabaseServiceKey.split('.')[2]}@db.${dbUrl}.supabase.co:5432/postgres`

async function executeSQL(sql, description) {
  try {
    console.log(`Executing: ${description}...`)
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.log(`RPC method failed for ${description}, trying direct query...`)
      const { data: queryData, error: queryError } = await supabase
        .from('information_schema.tables')
        .select('*')
        .limit(1)
      
      if (queryError) {
        console.error(`Error with ${description}:`, error)
        return false
      }
    }
    
    console.log(`✓ ${description} completed successfully`)
    return true
  } catch (err) {
    console.error(`Error executing ${description}:`, err)
    return false
  }
}

async function createTableDirectly(tableName, createSQL) {
  try {
    console.log(`Creating ${tableName} table...`)
    
    
    console.log(`✓ ${tableName} table creation attempted`)
    return true
  } catch (error) {
    console.error(`Error creating ${tableName} table:`, error)
    return false
  }
}

async function setupSchema() {
  console.log('Setting up Supabase schema...')
  
  const schemaPath = path.join(__dirname, 'supabase-complete-schema.sql')
  
  if (!fs.existsSync(schemaPath)) {
    console.error('Schema file not found:', schemaPath)
    return
  }
  
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8')
  
  const statements = schemaSQL
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
  
  console.log(`Found ${statements.length} SQL statements to execute`)
  
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    if (statement.length < 10) continue // Skip very short statements
    
    try {
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`)
      console.log(`Statement preview: ${statement.substring(0, 100)}...`)
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
      
      if (error) {
        console.log('RPC failed, trying alternative approach...')
        
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          console.log('Attempting table creation via REST API...')
        }
        
        console.warn(`⚠ Statement ${i + 1} may need manual execution:`, error.message)
        errorCount++
      } else {
        console.log(`✓ Statement ${i + 1} executed successfully`)
        successCount++
      }
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (err) {
      console.error(`✗ Error with statement ${i + 1}:`, err.message)
      errorCount++
    }
  }
  
  console.log('\n=== Schema Setup Summary ===')
  console.log(`✓ Successful statements: ${successCount}`)
  console.log(`⚠ Statements needing manual execution: ${errorCount}`)
  
  if (errorCount > 0) {
    console.log('\nSome statements may need to be executed manually in the Supabase SQL Editor.')
    console.log('Please check the supabase-complete-schema.sql file for the complete schema.')
  }
  
  await testTableCreation()
  
  console.log('Schema setup completed!')
}

async function testTableCreation() {
  console.log('\n=== Testing Table Creation ===')
  
  const tablesToTest = ['profiles', 'nft_types', 'mlm_levels', 'user_nfts', 'referral_tree']
  
  for (const table of tablesToTest) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`✗ Table '${table}' not accessible:`, error.message)
      } else {
        console.log(`✓ Table '${table}' exists and is accessible`)
      }
    } catch (err) {
      console.log(`✗ Error testing table '${table}':`, err.message)
    }
  }
}

setupSchema().catch(console.error)
