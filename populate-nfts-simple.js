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

const ALL_NFTS = [
  { name: 'SHOGUN NFT 300', price_usdt: 300, daily_return_rate: 0.005, is_special: false },
  { name: 'SHOGUN NFT 500', price_usdt: 500, daily_return_rate: 0.005, is_special: false },
  { name: 'SHOGUN NFT 1000', price_usdt: 1000, daily_return_rate: 0.0125, is_special: false },
  { name: 'SHOGUN NFT 3000', price_usdt: 3000, daily_return_rate: 0.01, is_special: false },
  { name: 'SHOGUN NFT 5000', price_usdt: 5000, daily_return_rate: 0.01, is_special: false },
  { name: 'SHOGUN NFT 10000', price_usdt: 10000, daily_return_rate: 0.0125, is_special: false },
  { name: 'SHOGUN NFT 30000', price_usdt: 30000, daily_return_rate: 0.015, is_special: false },
  { name: 'SHOGUN NFT 100000', price_usdt: 100000, daily_return_rate: 0.02, is_special: false },
  { name: 'SHOGUN NFT 100', price_usdt: 100, daily_return_rate: 0.005, is_special: true },
  { name: 'SHOGUN NFT 200', price_usdt: 200, daily_return_rate: 0.005, is_special: true },
  { name: 'SHOGUN NFT 600', price_usdt: 600, daily_return_rate: 0.005, is_special: true },
  { name: 'SHOGUN NFT 1177', price_usdt: 1177, daily_return_rate: 0.01, is_special: true },
  { name: 'SHOGUN NFT 1300', price_usdt: 1300, daily_return_rate: 0.01, is_special: true },
  { name: 'SHOGUN NFT 1500', price_usdt: 1500, daily_return_rate: 0.01, is_special: true },
  { name: 'SHOGUN NFT 2000', price_usdt: 2000, daily_return_rate: 0.01, is_special: true },
  { name: 'SHOGUN NFT 6600', price_usdt: 6600, daily_return_rate: 0.0125, is_special: true },
  { name: 'SHOGUN NFT 8000', price_usdt: 8000, daily_return_rate: 0.0125, is_special: true }
]

async function populateNFTs() {
  try {
    console.log('🚀 Starting NFT population...')
    
    const { error: deleteError } = await supabase
      .from('nft_types')
      .delete()
      .gt('id', 0)
    
    if (deleteError) {
      console.log('⚠️ Could not clear existing NFTs:', deleteError.message)
    } else {
      console.log('🗑️ Cleared existing NFTs')
    }
    
    const { data, error } = await supabase
      .from('nft_types')
      .insert(ALL_NFTS)
      .select()
    
    if (error) {
      console.error('❌ Error inserting NFTs:', error)
      return
    }
    
    console.log('✅ Successfully populated', data.length, 'NFTs:')
    data.forEach(nft => {
      console.log(`  - ${nft.name}: ${nft.price_usdt} USDT (${(nft.daily_return_rate * 100).toFixed(2)}%)`)
    })
    
    console.log('🎉 NFT population completed successfully!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

populateNFTs()
