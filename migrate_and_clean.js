
/**
 * MIGRATION & CLEANUP SCRIPT
 * Usage: 
 * export NEXT_PUBLIC_SUPABASE_URL="your_url"
 * export SUPABASE_SERVICE_ROLE_KEY="your_key"
 * node migrate_and_clean.js
 */

const { createClient } = require('@supabase/supabase-js');

// Read from Env
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("❌ Error: Missing Environment Variables.");
    console.log("Usage: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node migrate_and_clean.js");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function migrateAndClean() {
    console.log("🚀 Starting Safe Migration...");

    // 1. List files in course-materials
    const { data: files, error: listError } = await supabase.storage
        .from('course-materials')
        .list('uploads', { limit: 1000 });

    if (listError) {
        console.error("❌ Error listing files:", listError);
        return;
    }

    let movedCount = 0;
    let errorCount = 0;

    console.log(`📂 Found ${files.length} files. Scanning for PDFs...`);

    for (const file of files) {
        if (file.name.toLowerCase().endsWith('.pdf')) {
            const oldPath = `uploads/${file.name}`;
            console.log(`\nProcessing: ${file.name}`);

            // A. Check if already exists in Secure Bucket
            const { data: exists } = await supabase.storage.from('secure-materials').list('uploads', { search: file.name });
            if (exists && exists.length > 0) {
                console.log(`   ⚠️ Already exists in secure-materials. Skipping upload.`);
            } else {
                // B. Download from Old
                const { data: blob, error: downError } = await supabase.storage
                    .from('course-materials')
                    .download(oldPath);

                if (downError) {
                    console.error(`   ❌ Failed to download`, downError);
                    errorCount++;
                    continue;
                }

                // C. Upload to Secure
                const { error: upError } = await supabase.storage
                    .from('secure-materials')
                    .upload(oldPath, blob, {
                        contentType: 'application/pdf',
                        upsert: true
                    });

                if (upError) {
                    console.error(`   ❌ Failed to upload`, upError);
                    errorCount++;
                    continue;
                }
                console.log(`   ✅ Uploaded to secure bucket.`);
            }

            // D. DELETE from Old (Cleanup)
            // Only delete if we are sure it's safe (i.e. upload succeeded or existed)
            // Double check existence one last time?
            // Rely on previous steps.

            const { error: delError } = await supabase.storage
                .from('course-materials')
                .remove([oldPath]);

            if (delError) {
                console.error(`   ❌ Failed to delete original`, delError);
            } else {
                console.log(`   🗑️  Deleted from course-materials.`);
                movedCount++;
            }
        }
    }

    console.log(`\n✨ Migration Complete.`);
    console.log(`📦 Moved & Cleaned: ${movedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`\n👉 NEXT STEP: Go to Supabase -> Storage -> 'course-materials' -> Settings -> Make PUBLIC.`);
}

migrateAndClean(); 
