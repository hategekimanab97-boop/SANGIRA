export interface ServiceReadiness {
  configured: boolean;
  label: string;
  missingKeys: string[];
  requiredKeys: string[];
  optionalKeys?: string[];
  description: string;
  setupHint: string;
}

export interface IntegrationStatusReport {
  overallReady: boolean;
  services: {
    supabase: ServiceReadiness;
    betterAuth: ServiceReadiness;
    resend: ServiceReadiness;
  };
  allMissingKeys: string[];
  checkedAt: string;
}

function isPopulated(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('MY_') || trimmed === 'undefined' || trimmed === 'null') return false;
  return true;
}

export function getIntegrationStatus(): IntegrationStatusReport {
  const missingSupabase: string[] = [];
  if (!isPopulated(process.env.DATABASE_URL)) missingSupabase.push('DATABASE_URL');

  const missingBetterAuth: string[] = [];
  if (!isPopulated(process.env.BETTER_AUTH_SECRET)) missingBetterAuth.push('BETTER_AUTH_SECRET');
  if (!isPopulated(process.env.DATABASE_URL) && !missingBetterAuth.includes('DATABASE_URL')) {
    missingBetterAuth.push('DATABASE_URL');
  }

  const missingResend: string[] = [];
  if (!isPopulated(process.env.RESEND_API_KEY)) missingResend.push('RESEND_API_KEY');

  const supabaseConfigured = !missingSupabase.includes('DATABASE_URL');
  const betterAuthConfigured =
    isPopulated(process.env.BETTER_AUTH_SECRET) && isPopulated(process.env.DATABASE_URL);
  const resendConfigured = isPopulated(process.env.RESEND_API_KEY);

  const allMissingKeys = Array.from(
    new Set([...missingSupabase, ...missingBetterAuth, ...missingResend])
  );

  return {
    overallReady: supabaseConfigured && betterAuthConfigured && resendConfigured && allMissingKeys.length === 0,
    services: {
      supabase: {
        configured: supabaseConfigured,
        label: 'Supabase PostgreSQL + RLS',
        requiredKeys: ['DATABASE_URL'],
        optionalKeys: ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
        missingKeys: missingSupabase,
        description:
          'Multi-tenant PostgreSQL database with Row-Level Security policies and atomic recipe stock transactions.',
        setupHint:
          'Copy your PostgreSQL connection URI from Supabase Dashboard → Connect → Connection string (URI), then execute supabase/schema_and_rls.sql.',
      },
      betterAuth: {
        configured: betterAuthConfigured,
        label: 'Better Auth Staff Sessions',
        requiredKeys: ['BETTER_AUTH_SECRET', 'DATABASE_URL'],
        optionalKeys: ['BETTER_AUTH_URL'],
        missingKeys: missingBetterAuth,
        description:
          'Cryptographic cookie sessions and role-based access enforcement for all hotel, kitchen, bar, stock, and cashier staff.',
        setupHint:
          'Generate a 32+ character secret for BETTER_AUTH_SECRET and ensure DATABASE_URL points to your Supabase PostgreSQL instance.',
      },
      resend: {
        configured: resendConfigured,
        label: 'Resend + React Email',
        requiredKeys: ['RESEND_API_KEY'],
        optionalKeys: ['RESEND_FROM_EMAIL'],
        missingKeys: missingResend,
        description:
          'Automated transactional emails for business approvals/rejections, guest MoMo receipts, and staff shift alerts.',
        setupHint:
          'Create an API key at resend.com/api-keys and add it as RESEND_API_KEY in Secrets (sender defaults to onboarding@resend.dev).',
      },
    },
    allMissingKeys,
    checkedAt: new Date().toISOString(),
  };
}
