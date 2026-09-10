import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { path: string[] } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

  const apiPath = params.path.join('/');
  const searchParams = new URL(req.url).search;
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  try {
    const response = await fetch(`${API_URL}/${apiPath}${searchParams}`, {
      method: 'GET',
      headers: {
        'X-User-Id': user.id,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
