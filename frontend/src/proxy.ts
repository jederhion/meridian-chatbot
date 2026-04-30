import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // We only want to intercept requests going to /api/
  if (request.nextUrl.pathname.startsWith('/api/')) {
    
    // Read the variable dynamically at RUNTIME
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    // Construct the destination URL
    const targetUrl = new URL(
      request.nextUrl.pathname + request.nextUrl.search, 
      backendUrl
    );
    
    // Securely proxy the request to the Python backend
    return NextResponse.rewrite(targetUrl);
  }
  
  return NextResponse.next();
}

// Ensure the middleware only runs on API paths to keep your app fast
export const config = {
  matcher: '/api/:path*',
};