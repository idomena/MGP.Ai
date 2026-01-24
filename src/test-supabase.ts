import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', SUPABASE_URL ? 'set' : 'missing');
  console.log('VITE_SUPABASE_ANON_API_KEY:', SUPABASE_KEY ? 'set' : 'missing');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    const { data, error } = await supabase
      .from('workout_completions')
      .select('*');
    
    if (error) {
      console.error('Error fetching workout_templates:', error.message);
      console.error('Error details:', error);
      return;
    }
    
    console.log('Successfully connected to Supabase!');
    console.log('workout_templates data:', data);
    console.log('Total records:', data?.length ?? 0);
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

testSupabaseConnection();
