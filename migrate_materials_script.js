
/**
 * MIGRATION SCRIPT (Optional)
 * Usage: node migrate_materials.js
 * 
 * This script is for MOVING existing files from 'course-materials' to 'secure-materials'.
 * Currently, the system supports READING from both, but for better security, 
 * you should eventually move them and make 'course-materials' strictly for images.
 * 
 * Pre-requisites:
 * 1. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars set.
 * 2. npm install @supabase/supabase-js
 */

const { createClient } = require('@supabase/supabase-js');

// REPLACE WITH YOUR CREDENTIALS
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SERVICE_KEY = 'YOUR_SERVICE_KEY';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function migrate() {
    console.log("Starting Migration...");

    // 1. List files in course-materials
    const { data: files, error: listError } = await supabase.storage
        .from('course-materials')
        .list('uploads', { limit: 1000 });

    if (listError) {
        console.error("Error listing files:", listError);
        return;
    }

    console.log(`Found ${files.length} files to potentially migrate.`);

    for (const file of files) {
        if (file.name.endsWith('.pdf')) {
            console.log(`Migrating PDF: ${file.name}`);

            // Download
            const { data: blob, error: downError } = await supabase.storage
                .from('course-materials')
                .download(`uploads/${file.name}`);

            if (downError) {
                console.error(`Failed to download ${file.name}`, downError);
                continue;
            }

            // Upload to Secure
            const { error: upError } = await supabase.storage
                .from('secure-materials')
                .upload(`uploads/${file.name}`, blob, {
                    contentType: 'application/pdf',
                    upsert: true
                });

            if (upError) {
                console.error(`Failed to upload ${file.name} to secure`, upError);
                continue;
            }

            console.log(`Moved ${file.name} success.`);
        }
    }

    console.log("Migration Complete. You can now restrict 'course-materials' access.");
}

// migrate(); 
