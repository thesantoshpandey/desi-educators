import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const { data: { user } } = await supabase.auth.getUser()

    // --- Route Protection ---
    const path = request.nextUrl.pathname;

    // 1. Admin Routes Protection
    if (path.startsWith('/admin')) {
        // Check if user is logged in
        if (!user) {
            // Allow access to login page
            if (path !== '/admin/login') {
                return NextResponse.redirect(new URL('/admin/login', request.url));
            }
        } else {
            // User is logged in, check role
            // User is logged in, check role
            const userEmail = user.email?.toLowerCase();
            const adminEmail = 'vishal.pandey1912@gmail.com'.toLowerCase();

            // EXACT MATCH for security
            const isAdmin = userEmail === adminEmail;

            if (!isAdmin) {
                console.warn(`Unauthorized admin access attempt by ${userEmail} (Expected: ${adminEmail})`);
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }

            // Redirect logged-in admin away from login page
            if (path === '/admin/login') {
                return NextResponse.redirect(new URL('/admin/content', request.url));
            }
        }
    }

    // 2. Protected User Routes
    // Add other protected routes here as the app grows
    const protectedRoutes = ['/profile', '/quiz', '/update-password'];
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

    if (isProtectedRoute && !user) {
        const redirectUrl = new URL('/login', request.url);
        // Store the original url to redirect back after login
        redirectUrl.searchParams.set('redirectTo', path);
        return NextResponse.redirect(redirectUrl);
    }

    // Add Content Security Policy (CSP)
    // We use a permissive policy for 'script-src' to allow 'unsafe-eval' (needed for some dev tools/libraries)
    // and 'unsafe-inline' (common in Next.js).
    // We explicitly allow Razorpay and Google APIs.
    // We explicitly allow Razorpay and Google APIs.
    let cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://apis.google.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co https://lumberjack.razorpay.com https://*.razorpay.com;
    frame-src 'self' https://checkout.razorpay.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  `

    if (process.env.NODE_ENV === 'production') {
        cspHeader += ' upgrade-insecure-requests;';
    }

    // Temporarily disabled CSP to debug Razorpay freeze issue
    // response.headers.set(
    //    'Content-Security-Policy',
    //    cspHeader.replace(/\s{2,}/g, ' ').trim()
    // )

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images (public images)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
