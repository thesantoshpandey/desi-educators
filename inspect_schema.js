const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envConfig = {};

envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1'); // Remove quotes if any
        envConfig[key] = value;
    }
});

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Could not find Supabase URL or Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
    console.log("Inspecting 'quiz_attempts'...");

    // 1. Try Select (might return empty if no rows, but we want keys)
    const { data, error } = await supabase.from('quiz_attempts').select('*').limit(1);

    if (error) {
        console.error("Select Error:", error);
        // If select fails, maybe try insert to see column error?
        const { error: insertError } = await supabase.from('quiz_attempts').insert({ 'invalid_col': 1 });
        if (insertError) console.log("Insert Error (May reveal columns):", insertError);
    } else {
        if (data.length > 0) {
            console.log("Existing Row Keys:", Object.keys(data[0]));
        } else {
            console.log("Table exists but is empty. Trying to insert invalid col to trigger error...");
            const { error: insertError } = await supabase.from('quiz_attempts').insert({ 'invalid_col': 1 });
            if (insertError) console.log("Insert Error (May reveal columns):", insertError);
        }
    }
}

inspectTable();
