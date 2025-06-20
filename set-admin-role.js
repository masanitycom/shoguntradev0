const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://xkgdzmxltnnclvnrpylo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZ2R6bXhsdG5uY2x2bnJweWxvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDI2NDg3MCwiZXhwIjoyMDY1ODQwODcwfQ.SbC_vwidkvR6xVJgQqF6Ga2M9FxYWjg7VublyfWNRag',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function setAdminRole() {
  try {
    console.log('🚀 Setting admin role for all users...')
    
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('user_id, email, role')
    
    if (fetchError) {
      console.error('❌ Error fetching profiles:', fetchError)
      return
    }
    
    console.log('📋 Found profiles:', profiles?.length || 0)
    
    if (!profiles || profiles.length === 0) {
      console.log('⚠️ No profiles found. Creating a test admin user...')
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: 'admin-test-user',
          email: 'admin@shogun-trade.com',
          role: 'admin',
          username: 'admin'
        })
        .select()
      
      if (createError) {
        console.error('❌ Error creating admin profile:', createError)
        return
      }
      
      console.log('✅ Created admin profile:', newProfile)
      return
    }
    
    const { data: updatedProfiles, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .neq('role', 'admin')
      .select()
    
    if (updateError) {
      console.error('❌ Error updating profiles to admin:', updateError)
      return
    }
    
    console.log('✅ Updated profiles to admin role:', updatedProfiles?.length || 0)
    
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('user_id, email, role')
    
    console.log('📋 All profiles now:')
    allProfiles?.forEach(profile => {
      console.log(`  - ${profile.email || profile.user_id}: ${profile.role}`)
    })
    
    console.log('🎉 Admin role setup completed!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

setAdminRole()
