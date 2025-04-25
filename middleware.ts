import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return new NextResponse('Token not found', { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET),
    );

    // Append the parsed JWT payload to the request headers
    const response = NextResponse.next();
    response.headers.set('x-jwt-payload', JSON.stringify(payload));
    return response;
  } catch (error) {
    return new NextResponse('Token not found', { status: 401 });
  }
}

export const config = {
  matcher: [
    '/api/auction/create',
    '/api/auction/bid',
    '/api/auction/handle',
    '/api/auction/auction-cancel',
  ],
};
