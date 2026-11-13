import { betterAuth } from 'better-auth';
import { fromNodeHeaders } from 'better-auth/node';
import type { IncomingHttpHeaders } from 'node:http';
import type { Pool } from 'pg';
import { getDbPool } from '../db/pool.ts';

function createBetterAuthInstance(pool: Pool, secret: string, baseURL: string) {
  return betterAuth({
    database: pool,
    secret,
    baseURL,
    trustedOrigins: [
      baseURL,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://*.run.app',
      'https://*.ngrok-free.app',
      'https://*.ngrok-free.dev',
      'https://*.ngrok.io',
      ...(process.env.APP_URL ? [process.env.APP_URL] : []),
    ],
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    user: {
      additionalFields: {
        role: {
          type: 'string',
          required: false,
          defaultValue: 'HOTEL_MANAGER',
        },
        business_id: {
          type: 'string',
          required: false,
          defaultValue: 'biz-grand-kigali',
        },
        department: {
          type: 'string',
          required: false,
          defaultValue: 'Executive Management',
        },
        phone: {
          type: 'string',
          required: false,
          defaultValue: '+250 788 000 000',
        },
        employee_id: {
          type: 'string',
          required: false,
          defaultValue: 'EMP-01',
        },
      },
    },
  });
}

let authInstance: ReturnType<typeof createBetterAuthInstance> | null = null;
let cachedKey = '';

export function getAuth() {
  const pool = getDbPool();
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  const baseURL =
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    'http://localhost:3000';

  if (!pool || !secret || secret.startsWith('MY_')) {
    return null;
  }

  const key = `${process.env.DATABASE_URL}::${secret}::${baseURL}`;
  if (authInstance && cachedKey === key) {
    return authInstance;
  }

  cachedKey = key;
  authInstance = createBetterAuthInstance(pool, secret, baseURL);

  return authInstance;
}

export interface StaffSessionInfo {
  authenticated: boolean;
  configured: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: string;
    businessId: string;
    department: string;
    phone: string;
    employeeId: string;
  } | null;
}

export async function getStaffSession(headers: IncomingHttpHeaders): Promise<StaffSessionInfo> {
  const auth = getAuth();
  if (!auth) {
    return {
      authenticated: false,
      configured: false,
      user: null,
    };
  }

  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(headers),
    });

    if (!session || !session.user) {
      return {
        authenticated: false,
        configured: true,
        user: null,
      };
    }

    const u = session.user as Record<string, unknown>;
    return {
      authenticated: true,
      configured: true,
      user: {
        id: String(u.id || ''),
        name: String(u.name || 'Staff Member'),
        email: String(u.email || ''),
        image: typeof u.image === 'string' ? u.image : null,
        role: String(u.role || 'HOTEL_MANAGER'),
        businessId: String(u.business_id || 'biz-grand-kigali'),
        department: String(u.department || 'Operations'),
        phone: String(u.phone || '+250 788 000 000'),
        employeeId: String(u.employee_id || 'EMP-01'),
      },
    };
  } catch (err) {
    console.error('[Better Auth Session Lookup Error]', err);
    return {
      authenticated: false,
      configured: true,
      user: null,
    };
  }
}
