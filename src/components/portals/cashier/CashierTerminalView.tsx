import React, { useState } from 'react';
import { useSangira } from '../../../context/SangiraContext';
import { PaymentTransaction } from '../../../types';
import {
  CreditCard,
  Smartphone,
  DollarSign,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Receipt,
  AlertTriangle,
  Lock,
  ArrowRight,
} from 'lucide-react';

export const CashierTerminalView: React.FC = () => {
  const {
    payments,
    verifyPayment,
    cashSession,
    closeCashSession,
    activeTab,
    setActiveTab,
  } = useSangira();

  const [methodFilter, setMethodFilter] = useState<'all' | 'mtn_momo' | 'airtel_money' | 'cash' | 'bank_card'>('all');
  const [search, setSearch] = useState('');
  const [actualCashCount, setActualCashCount] = useState<number>(cashSession.expectedCash);
  const [closingNotes, setClosingNotes] = useState('All transactions reconciled against MoMo terminals.');

  const filteredPayments = payments.filter((p) => {
    const matchesMethod = methodFilter === 'all' || p.method === methodFilter;
    const matchesSearch =
      p.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.reference.toLowerCase().includes(search.toLowerCase()) ||
      p.customerPhoneOrName.toLowerCase().includes(search.toLowerCase());
    return matchesMethod && matchesSearch;
  });

  const pendingCount = payments.filter((p) => p.status === 'pending').length;
  const verifiedTotal = payments
    .filter((p) => p.status === 'verified')
    .reduce((acc, p) => acc + p.amount, 0);

  const handleCloseRegister = (e: React.FormEvent) => {
    e.preventDefault();
    closeCashSession(actualCashCount, closingNotes);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
            Settlement & Financial Integrity
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-800 dark:text-emerald-400" />
            <span>Cashier Terminal & Settlement</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Verify MTN Mobile Money, Airtel Money, and card transactions. Perform daily cash drawer closing and reconciliation.
          </p>
        </div>

        {/* Tab Switch Pills */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-1 rounded-xl text-xs font-semibold overflow-x-auto scrollbar-none max-w-full">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-stone-800 text-emerald-950 dark:text-emerald-300 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <span>Live Transactions</span>
            {pendingCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('closing')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'closing'
                ? 'bg-white dark:bg-stone-800 text-emerald-950 dark:text-emerald-300 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Register Closing & Reconciliation
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121614] shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Verified Settlements</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums">
            {verifiedTotal.toLocaleString()} <span className="text-xs font-sans text-stone-500">RWF</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">Today's verified turnover</div>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121614] shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Pending Verifications</div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
            {pendingCount}
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">Awaiting cashier review</div>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121614] shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Digital MoMo Share</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1 tabular-nums">
            {cashSession.digitalTotal.toLocaleString()} <span className="text-xs font-sans text-stone-500">RWF</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">MTN MoMo + Airtel Money</div>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121614] shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Expected Drawer Cash</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1 tabular-nums">
            {cashSession.expectedCash.toLocaleString()} <span className="text-xs font-sans text-stone-500">RWF</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">Opening float + cash takings</div>
        </div>
      </div>

      {/* Main Tab: Live Transactions Feed */}
      {activeTab === 'dashboard' && (
        <div className="bg-white dark:bg-[#121614] rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs space-y-4 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1 text-xs">
              {(['all', 'mtn_momo', 'airtel_money', 'cash', 'bank_card'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethodFilter(m)}
                  className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                    methodFilter === m
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search order or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-900/50 text-stone-500 uppercase text-[10px] tracking-wider border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-3 px-3">Transaction Ref</th>
                  <th className="py-3 px-3">Order / Table</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3 font-mono text-right">Amount</th>
                  <th className="py-3 px-3">Customer Reference</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Cashier Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/30 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-stone-900 dark:text-stone-100">
                      {pay.reference}
                      <div className="text-[10px] text-stone-400 font-normal">
                        {new Date(pay.transactionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{pay.orderNumber}</div>
                      <div className="text-[11px] text-stone-500">{pay.tableNumber}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="capitalize font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                        {pay.method === 'mtn_momo' && (
                          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        )}
                        {pay.method === 'airtel_money' && (
                          <span className="w-2 h-2 rounded-full bg-red-600"></span>
                        )}
                        {pay.method === 'bank_card' && (
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        )}
                        {pay.method === 'cash' && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        )}
                        {pay.method.replace('_', ' ')}
                      </span>
                      <div className="text-[10px] text-stone-400 font-mono">{pay.providerRef}</div>
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-right text-stone-900 dark:text-stone-100 tabular-nums">
                      {pay.amount.toLocaleString()} RWF
                    </td>

                    <td className="py-3.5 px-3 text-stone-600 dark:text-stone-300 font-mono text-[11px]">
                      {pay.customerPhoneOrName}
                    </td>

                    <td className="py-3.5 px-3">
                      {pay.status === 'verified' ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1 text-[11px]">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      {pay.status === 'pending' ? (
                        <button
                          onClick={() => verifyPayment(pay.id, 'Diane Ingabire (Cashier)')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-900 dark:bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] transition-colors shadow-xs"
                        >
                          Verify Settlement
                        </button>
                      ) : (
                        <span className="text-stone-400 text-[11px] font-mono">
                          By {pay.verifiedBy || 'Cashier'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Register Closing & Reconciliation Tab */}
      {activeTab === 'closing' && (
        <div className="bg-white dark:bg-[#121614] rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 max-w-3xl mx-auto shadow-xs space-y-6">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-800 dark:text-emerald-400 shrink-0" />
              <span>Daily Cashier Register Closing & Discrepancy Reconciliation</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Cashier: <strong>{cashSession.cashierName}</strong> · Opened at{' '}
              {new Date(cashSession.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <form onSubmit={handleCloseRegister} className="space-y-5 text-xs">
            {/* Calculation Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800">
              <div>
                <span className="text-stone-400 uppercase text-[10px] font-bold">Opening Cash Float</span>
                <div className="font-mono font-bold text-base text-stone-900 dark:text-stone-100">
                  {cashSession.openingBalance.toLocaleString()} RWF
                </div>
              </div>

              <div>
                <span className="text-stone-400 uppercase text-[10px] font-bold">Cash Takings Received</span>
                <div className="font-mono font-bold text-base text-emerald-700 dark:text-emerald-400">
                  +{cashSession.cashReceived.toLocaleString()} RWF
                </div>
              </div>

              <div>
                <span className="text-stone-400 uppercase text-[10px] font-bold">Card Payments</span>
                <div className="font-mono font-bold text-base text-stone-900 dark:text-stone-100">
                  {cashSession.cardTotal.toLocaleString()} RWF
                </div>
              </div>

              <div>
                <span className="text-stone-400 uppercase text-[10px] font-bold">Digital MoMo Total</span>
                <div className="font-mono font-bold text-base text-stone-900 dark:text-stone-100">
                  {cashSession.digitalTotal.toLocaleString()} RWF
                </div>
              </div>
            </div>

            {/* Expected vs Actual */}
            <div className="p-4 rounded-xl border-2 border-emerald-800/40 dark:border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-stone-700 dark:text-stone-300 font-semibold text-xs">
                  Expected Physical Cash in Drawer:
                </span>
                <span className="font-mono font-bold text-lg text-emerald-950 dark:text-emerald-100 tabular-nums">
                  {cashSession.expectedCash.toLocaleString()} RWF
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-800 dark:text-stone-200 mb-1">
                  Actual Physical Cash Counted (RWF) *
                </label>
                <input
                  type="number"
                  value={actualCashCount}
                  onChange={(e) => setActualCashCount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono font-bold text-base focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 text-xs">
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  Variance / Discrepancy:
                </span>
                <span
                  className={`font-mono font-bold text-sm tabular-nums ${
                    actualCashCount - cashSession.expectedCash === 0
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {(actualCashCount - cashSession.expectedCash).toLocaleString()} RWF
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Closing Reconciliation Notes
              </label>
              <textarea
                rows={2}
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:outline-hidden"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-emerald-900 dark:bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors flex items-center gap-2 shadow-xs"
              >
                <Lock className="w-4 h-4" />
                <span>Execute Register Shift Close</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
