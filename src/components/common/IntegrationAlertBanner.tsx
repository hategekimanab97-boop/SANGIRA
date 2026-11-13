import React, { useState } from 'react';
import { useSangira } from '../../context/SangiraContext';
import {
  KeyRound,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  ShieldCheck,
  Mail,
  Send,
  ChevronDown,
  ChevronUp,
  X,
  Copy,
  Check,
} from 'lucide-react';

const ENV_KEY_HINTS: Record<string, { example: string; where: string }> = {
  DATABASE_URL: {
    example: 'postgresql://postgres.[ref]:[PASSWORD]@aws-0-...pooler.supabase.com:6543/postgres',
    where: 'Supabase → Connect → Connection string (URI)',
  },
  SUPABASE_URL: {
    example: 'https://[your-project-ref].supabase.co',
    where: 'Supabase → Project Settings → Data API',
  },
  SUPABASE_ANON_KEY: {
    example: 'sb_publishable_... (or eyJ... anon key)',
    where: 'Supabase → Project Settings → API Keys (Publishable)',
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    example: 'sb_secret_... (or eyJ... service_role key)',
    where: 'Supabase → Project Settings → API Keys (Secret)',
  },
  BETTER_AUTH_SECRET: {
    example: 'any-random-32-character-or-longer-secret-string',
    where: 'Create any random 32+ character string',
  },
  BETTER_AUTH_URL: {
    example: 'https://your-app-url.run.app (or http://localhost:3000)',
    where: 'Your deployed Cloud Run / AI Studio app URL',
  },
  RESEND_API_KEY: {
    example: 're_xxxxxxxxxxxxxxxxxxxxxxxxx',
    where: 'resend.com/api-keys → Create API Key',
  },
  RESEND_FROM_EMAIL: {
    example: 'Sangira Hospitality <onboarding@resend.dev>',
    where: 'Your verified Resend sender email',
  },
};

export const IntegrationAlertBanner: React.FC = () => {
  const {
    integrationStatus,
    refreshIntegrationStatus,
    sendTestEmail,
    lastEmailAlert,
    clearLastEmailAlert,
    currentStaffUser,
  } = useSangira();

  const [isExpanded, setIsExpanded] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testEmailInput, setTestEmailInput] = useState(currentStaffUser?.email || '');
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleCopyKeyName = async (keyName: string) => {
    try {
      await navigator.clipboard.writeText(keyName);
      setCopiedKey(keyName);
      setTimeout(() => setCopiedKey((prev) => (prev === keyName ? null : prev)), 1800);
    } catch {
      // Clipboard API unavailable in restricted context
    }
  };

  const handleRecheck = async () => {
    setIsChecking(true);
    await refreshIntegrationStatus();
    setIsChecking(false);
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailInput.trim()) return;
    setIsSendingTest(true);
    const res = await sendTestEmail(testEmailInput.trim());
    setTestResult(res);
    setIsSendingTest(false);
  };

  if (!integrationStatus) return null;

  const missingCount = integrationStatus.allMissingKeys.length;
  const showSetupBanner = !dismissed && (!integrationStatus.overallReady || !integrationStatus.databaseReachable);

  return (
    <div className="space-y-2 px-3 sm:px-6 pt-3 max-w-7xl mx-auto w-full">
      {/* Real-time Email Dispatch Notification Toast Banner */}
      {lastEmailAlert && (
        <div
          className={`rounded-xl border px-3.5 py-2.5 text-xs flex items-center justify-between gap-3 ${
            lastEmailAlert.status === 'sent'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : lastEmailAlert.status === 'missing_key'
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="w-4 h-4 shrink-0" />
            <span className="truncate font-medium">{lastEmailAlert.message}</span>
          </div>
          <button
            type="button"
            onClick={clearLastEmailAlert}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 shrink-0 cursor-pointer"
            aria-label="Dismiss email notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Missing API Keys / Environment Configuration Notification */}
      {showSetupBanner && (
        <div className="rounded-xl border border-amber-300/80 dark:border-amber-700/60 bg-[#FFFDF9] dark:bg-[#121614] text-stone-800 dark:text-stone-200 overflow-hidden">
          <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 bg-amber-50/70 dark:bg-amber-950/20 border-b border-amber-200/70 dark:border-amber-800/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <KeyRound className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Environment Secrets Needed ({missingCount} missing key{missingCount === 1 ? '' : 's'})
                </h3>
                <p className="text-[11px] text-stone-600 dark:text-stone-400">
                  Open AI Studio <strong>Secrets</strong> (or click <strong>Deploy</strong>), paste each value into its matching named row, then click <strong>Re-check Keys</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRecheck}
                disabled={isChecking}
                className="min-h-[34px] px-3 py-1 rounded-lg bg-[#0E382B] hover:bg-[#144737] text-[#F3DF95] text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'Checking...' : 'Re-check Keys'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                aria-label={isExpanded ? 'Collapse key details' : 'Expand key details'}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
                aria-label="Hide configuration alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isExpanded && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {[
                  {
                    key: 'supabase',
                    icon: Database,
                    data: integrationStatus.services.supabase,
                    extraNote: integrationStatus.services.supabase.configured && !integrationStatus.databaseReachable
                      ? integrationStatus.databaseError || 'PostgreSQL connection pending'
                      : null,
                  },
                  {
                    key: 'betterAuth',
                    icon: ShieldCheck,
                    data: integrationStatus.services.betterAuth,
                    extraNote: null,
                  },
                  {
                    key: 'resend',
                    icon: Mail,
                    data: integrationStatus.services.resend,
                    extraNote: null,
                  },
                ].map(({ key, icon: Icon, data, extraNote }) => {
                  const isReady =
                    key === 'supabase'
                      ? data.configured && integrationStatus.databaseReachable
                      : data.configured;

                  return (
                    <div
                      key={key}
                      className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100">
                          <Icon className="w-4 h-4 text-[#B89320] dark:text-[#D4AF37] shrink-0" />
                          <span className="truncate">{data.label}</span>
                        </div>
                        {isReady ? (
                          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1 shrink-0">
                            <AlertTriangle className="w-3.5 h-3.5" /> Missing Keys
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                        {data.setupHint}
                      </p>

                      {data.missingKeys.length > 0 && (
                        <div className="pt-1 space-y-1.5">
                          <div className="text-[10px] font-semibold text-stone-500">
                            Match each row in AI Studio Secrets:
                          </div>
                          {data.missingKeys.map((keyName) => {
                            const hint = ENV_KEY_HINTS[keyName];
                            const isCopied = copiedKey === keyName;
                            return (
                              <div
                                key={keyName}
                                className="p-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/60 space-y-0.5"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono text-[11px] font-bold text-rose-700 dark:text-rose-400 break-all">
                                    {keyName}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyKeyName(keyName)}
                                    className="px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700 text-[10px] font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1 shrink-0 cursor-pointer"
                                    title={`Copy ${keyName}`}
                                  >
                                    {isCopied ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        <span>Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span>Copy</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                {hint && (
                                  <div className="text-[10px] text-stone-500 dark:text-stone-400 leading-snug break-all">
                                    <span className="font-mono">{hint.example}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {extraNote && (
                        <div className="text-[11px] font-mono text-amber-700 dark:text-amber-400 break-words">
                          {extraNote}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Optional Test Resend Email Form (only triggers when user clicks Send Test) */}
              <form
                onSubmit={handleSendTest}
                className="pt-3 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="text-[11px] text-stone-600 dark:text-stone-400">
                  <strong className="text-stone-800 dark:text-stone-200">Resend Verification:</strong>{' '}
                  Send a test React Email once <span className="font-mono">RESEND_API_KEY</span> is added.
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="you@domain.com"
                    value={testEmailInput}
                    onChange={(e) => setTestEmailInput(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs focus:outline-hidden min-w-[200px]"
                  />
                  <button
                    type="submit"
                    disabled={isSendingTest}
                    className="min-h-[34px] px-3 py-1.5 rounded-lg border border-[#D4AF37]/60 bg-[#FAF6EB] dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold text-[11px] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 hover:bg-[#D4AF37]/20 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-[#B89320]" />
                    <span>{isSendingTest ? 'Sending...' : 'Send Test Email'}</span>
                  </button>
                </div>
              </form>

              {testResult && (
                <div
                  className={`text-[11px] font-medium ${
                    testResult.ok
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {testResult.message}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
