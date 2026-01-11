
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ fileId: string }> }
) {
    const { fileId } = await params;

    // 1. Auth Check (Must use standard client to verify user cookie)
    const supabaseUserClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return req.cookies.getAll() },
            },
        }
    );

    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

    if (authError || !user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Entitlement Check (Optional: Check if user owns the course this file belongs to)
    // For now, we assume if they have the link and are logged in, we proceed. 
    // Ideally, we'd look up the fileId in 'materials' table and check 'enrollments'.

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

    try {
        // 4. Watermark Logic
        const arrayBuffer = await fileData.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        const { width, height } = pages[0].getSize();

        // Watermark Text
        const text = `${user.email} | ${user.id.slice(0, 8)} | ${new Date().toISOString().split('T')[0]}`;

        // Draw diagonal text on every page
        pages.forEach(page => {
            page.drawText(text, {
                x: 50,
                y: height / 2,
                size: 20,
                color: rgb(0.7, 0.7, 0.7), // Gray transparency simulation
                rotate: degrees(45),
                opacity: 0.3,
            });

            page.drawText('DESI EDUCATORS - DO NOT SHARE', {
                x: 50,
                y: height / 2 - 50,
                size: 15,
                color: rgb(0.9, 0.2, 0.2), // Redish
                rotate: degrees(45),
                opacity: 0.2,
            });
        });

        const pdfBytes = await pdfDoc.save();

        // 5. Stream Response
        return new NextResponse(pdfBytes, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${fileId}"`,
                // Prevent Caching ensuring watermark is always fresh
                'Cache-Control': 'no-store, max-age=0',
            },
        });

    } catch (err) {
        console.error('Streaming error:', err);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
