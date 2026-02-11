
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ fileId: string[] }> }
) {
    const { fileId: fileIdArray } = await params;
    const fileId = fileIdArray.join('/');

    // 1. Auth Check (Must use standard client to verify user cookie)
    const supabaseUserClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return req.cookies.getAll() },
                setAll(cookiesToSet) {
                    // Optional: Handle cookie updates if needed, but for GET stream it's usually not critical
                    // unless token refresh happens.
                }
            },
        }
    );

    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

    if (authError || !user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Entitlement Check via Database
    // We strictly verify if the user is enrolled in the content this file belongs to.
    try {
        const fileName = fileIdArray[fileIdArray.length - 1]; // "xyz.pdf"

        // Find which material this file belongs to.
        // Determining efficient look up: content is typically structured as uploads/filename
        // We look for 'uploads/fileName' in 'url' column.
        const { data: material } = await supabaseUserClient
            .from('materials')
            .select('topic_id')
            .ilike('url', `%${fileName}`)
            .single();

        if (material) {
            // Access Policy:
            // Files -> Topics -> Chapters -> Subjects
            // Users can be enrolled in: 'full_bundle', 'test_series', specific 'subject', or specific 'chapter'

            // Resolved Hierarchy
            const { data: topic } = await supabaseUserClient.from('topics').select('chapter_id').eq('id', material.topic_id).single();
            const chapterId = topic?.chapter_id;

            const { data: chapter } = await supabaseUserClient.from('chapters').select('subject_id').eq('id', chapterId).single();
            const subjectId = chapter?.subject_id;

            // Check Enrollments
            const { data: enrollments } = await supabaseUserClient
                .from('enrollments')
                .select('target_id')
                .eq('user_id', user.id);

            const enrolledIds = enrollments?.map(e => e.target_id) || [];

            const hasAccess = enrolledIds.includes('full_bundle') ||
                enrolledIds.includes(subjectId) ||
                enrolledIds.includes(chapterId) ||
                (user.user_metadata?.role === 'admin') || // Admin bypass
                (await supabaseUserClient.from('profiles').select('role').eq('id', user.id).single()).data?.role === 'admin';

            if (!hasAccess) {
                console.warn(`Blocked access to ${fileName} for user ${user.email}`);
                return new NextResponse('Forbidden: You are not enrolled in this content.', { status: 403 });
            }
        } else {
            console.warn(`File ${fileName} is orphaned (not linked to any material in DB).`);
            // Security Decision: Block orphaned files.
            return new NextResponse('Forbidden: Unlinked Content', { status: 403 });
        }

    } catch (checkError) {
        console.error('Entitlement check failed', checkError);
        // Fail Open or Closed?
        // FAIL CLOSED for security.
        return new NextResponse('Authorization Error', { status: 500 });
    }

    // 3. Download Original PDF (Try Secure First, then Legacy)
    let fileData;
    let usedBucket = 'secure-materials';

    // Attempt download from secure bucket
    const { data: secureData, error: secureError } = await supabaseAdmin
        .storage
        .from('secure-materials')
        .download(fileId);

    if (!secureError && secureData) {
        fileData = secureData;
    } else {
        // Fallback: Try course-materials (Legacy)
        // Note: fileId for legacy might look like "uploads/xyz.pdf"
        const { data: legacyData, error: legacyError } = await supabaseAdmin
            .storage
            .from('course-materials')
            .download(fileId);

        if (!legacyError && legacyData) {
            usedBucket = 'course-materials';
            fileData = legacyData;
        }
    }

    if (!fileData) {
        console.error('File not found in any bucket:', fileId);
        return new NextResponse('File not found', { status: 404 });
    }

    // 4. Watermark Logic
    try {
        const arrayBuffer = await fileData.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();

        // Fetch User Profile for Phone Number
        let phone = user.phone || '';
        try {
            const { data: profile } = await supabaseUserClient
                .from('profiles')
                .select('phone')
                .eq('id', user.id)
                .single();
            if (profile?.phone) {
                phone = profile.phone;
            }
        } catch (err) {
            console.warn('Failed to fetch profile phone for watermark');
        }

        // Watermark Text Construction
        const identifier = phone ? `${user.email} | ${phone}` : `${user.email}`;
        const dateStr = new Date().toISOString().split('T')[0];
        const text = `${identifier} | ${user.id.slice(0, 8)} | ${dateStr}`;

        const font = await pdfDoc.embedFont('Helvetica'); // Standard font
        const textSize = 18;
        const textWidth = font.widthOfTextAtSize(text, textSize);
        const textHeight = font.heightAtSize(textSize);

        pages.forEach(page => {
            const { width, height } = page.getSize();

            // Tiling Configuration
            const horizontalGap = 150; // Reverted closer to original (100 -> 150)
            const verticalGap = 150;   // Kept at 150

            // Calculate grid approximate
            // We'll just loop through coordinates to cover the page
            for (let y = 0; y < height; y += verticalGap) {
                for (let x = -100; x < width; x += (textWidth + horizontalGap)) {
                    // Stagger odd rows
                    const stagger = (Math.floor(y / verticalGap) % 2) * (textWidth / 2);

                    page.drawText(text, {
                        x: x + stagger,
                        y: y,
                        size: textSize, // Reverted to 18 (textSize variable)
                        color: rgb(0.6, 0.6, 0.6),
                        rotate: degrees(30),
                        opacity: 0.15,
                    });
                }
            }

            // Central Warning (Darker)
            page.drawText('DESI EDUCATORS - DO NOT SHARE', {
                x: width / 2 - 150,
                y: height / 2,
                size: 20,
                color: rgb(0.8, 0.2, 0.2),
                rotate: degrees(30),
                opacity: 0.25,
            });
        });

        const pdfBytes = await pdfDoc.save();

        // 5. Stream Response
        const buffer = Buffer.from(pdfBytes);
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${fileId.split('/').pop()}"`,
                'Content-Length': buffer.length.toString(),
                'Cache-Control': 'no-store, max-age=0',
            },
        });

    } catch (err) {
        console.error('Streaming/Watermarking error:', err);
        // Fallback: If watermark fails, decide whether to block or send un-watermarked. 
        // Best security practice: fail closed. But for robust UX, maybe retry?
        // Let's return 500 for now.
        return new NextResponse('Error generating secure document', { status: 500 });
    }
}
