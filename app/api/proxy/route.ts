// app/api/proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateSession, signSession } from '@/lib/utils/crypto';

const GAS_URL = process.env.GAS_URL || 'https://script.google.com/macros/s/AKfycbzIyNAxLklYx02U9GoUHMHKL1sFMPc1MZAbZvB9WwErzqK0GQYHjh3NcpcVdiEPuHRbpg/exec';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { functionName, arguments: args = [], rememberMe } = body;

    console.log(`[API Proxy] routing ${functionName} -> ${GAS_URL}`);

    if (!functionName) {
      return NextResponse.json({ success: false, error: 'Missing functionName action.' }, { status: 400 });
    }

    // 1. Auth Actions Bypass
    if (functionName === 'loginUser') {
      const [email, password] = args;
      
      const upstream = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          functionName: 'loginUser',
          arguments: [email, password]
        }),
      });

      if (!upstream.ok) {
        return NextResponse.json({ success: false, error: `Upstream gateway error: ${upstream.statusText}` }, { status: upstream.status });
      }

      const resData = await upstream.json();

      if (resData && resData.success) {
        const userPayload = {
          email: resData.email,
          name: resData.name,
          role: resData.role,
        };

        const token = await signSession(userPayload);
        const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 8 * 60 * 60; // 30 days vs 8 hours

        const response = NextResponse.json({
          success: true,
          user: userPayload
        });

        response.cookies.set('session', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: maxAge
        });

        return response;
      }

      return NextResponse.json(resData);
    }

    if (functionName === 'signupUser') {
      const upstream = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          functionName: 'signupUser',
          arguments: args
        }),
      });

      if (!upstream.ok) {
        return NextResponse.json({ success: false, error: `Upstream gateway error: ${upstream.statusText}` }, { status: upstream.status });
      }

      const resData = await upstream.json();
      return NextResponse.json(resData);
    }

    if (functionName === 'logoutUser') {
      const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
      response.cookies.delete('session');
      return response;
    }

    // 2. Protect All Other Routes
    const token = req.cookies.get('session')?.value;
    const session = token ? await validateSession(token) : null;

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized session. Please log in.' }, { status: 401 });
    }

    // 3. Forward Requests with Authenticated Context
    const upstream = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        functionName,
        arguments: args,
        sessionEmail: session.email
      }),
    });

    if (!upstream.ok) {
      return NextResponse.json({ success: false, error: `Upstream gateway error: ${upstream.statusText}` }, { status: upstream.status });
    }

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('API Proxy error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal proxy error' }, { status: 500 });
  }
}

// Add GET handler to verify current session token on mount
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('session')?.value;
    const session = token ? await validateSession(token) : null;
    
    if (!session) {
      return NextResponse.json({ success: false, error: 'No active session' }, { status: 401 });
    }
    
    return NextResponse.json({ success: true, user: session });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
