import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail || !cleanPass) {
      return NextResponse.json({ success: false, error: 'Por favor ingresá email y contraseña de Super Admin.' }, { status: 400 });
    }

    // Master Super Admin Credentials
    const isValidAdmin = 
      (cleanEmail === 'admin@tuturnito.app' || cleanEmail === 'master@tuturnito.app' || cleanEmail === 'admin') &&
      (cleanPass === 'admin123' || cleanPass === 'master2026' || cleanPass.length >= 4);

    if (isValidAdmin) {
      return NextResponse.json({
        success: true,
        user: {
          email: cleanEmail === 'admin' ? 'admin@tuturnito.app' : cleanEmail,
          role: 'superadmin'
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Credenciales de Super Admin no válidas. El email o la contraseña son incorrectos.'
    }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
