import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log("=== SQL: SELECT * FROM ledger ORDER BY created_at DESC LIMIT 5 ===")
  const { data: latestData, error: latestError } = await supabase
    .from('ledger')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  
  if (latestError) {
    console.error(latestError)
  } else {
    console.log(JSON.stringify(latestData, null, 2))
  }

  console.log("\n=== CURRENT FETCH QUERY ===")
  const { data, error } = await supabase
    .from('ledger')
    .select('*')
    .eq('type', 'receivable')
    .neq('status', 'paid')
    .not('due_date', 'is', null)
    .order('due_date', { ascending: true })

  if (error) {
    console.error(error)
  } else {
    console.log(`Found ${data.length} records.`)
    console.log(JSON.stringify(data, null, 2))
  }
}

main()
