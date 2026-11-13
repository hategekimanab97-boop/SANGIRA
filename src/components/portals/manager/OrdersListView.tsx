import React, { useState } from 'react';
import { useSangira } from '../../../context/SangiraContext';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle,
  Clock,
  UserCheck,
  CreditCard,
  ChefHat,
  Wine,
} from 'lucide-react';

export const OrdersListView: React.FC = () => {
  const { orders, tickets, payments, confirmDelivery } = useSangira();
  const [statusFilter, setStatusFilter] = useState<'all' | 'received' | 'preparing' | 'ready' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesQuery =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
            Order Flow
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            Live Customer Orders
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Monitor full customer order journeys from table QR submission to station preparation and server delivery.
          </p>
        </div>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-2">
          {/* Status filter tabs (swipable on mobile) */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-1 rounded-xl text-xs font-semibold overflow-x-auto scrollbar-none max-w-full shrink-0">
            {(['all', 'received', 'preparing', 'ready', 'delivered'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg capitalize transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white dark:bg-stone-800 text-emerald-950 dark:text-emerald-300 shadow-xs font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search table or order..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#121614] rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-900/50 text-stone-500 uppercase text-[10px] tracking-wider border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Table / Guest</th>
                <th className="py-3 px-4">Ordered Items</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Station Progress</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Service Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400 text-xs">
                    No orders match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const relatedTickets = tickets.filter((t) => t.orderId === ord.id);
                  const relatedPayment = payments.find((p) => p.orderId === ord.id);

                  return (
                    <tr key={ord.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-950 dark:text-emerald-300">
                        {ord.orderNumber}
                        <div className="text-[10px] text-stone-400 font-normal">
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-900 dark:text-stone-100">{ord.tableNumber}</div>
                        <div className="text-[11px] text-stone-500">{ord.customerName || 'Dine-in Guest'}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="text-stone-700 dark:text-stone-300 truncate">
                              <span className="font-semibold">{it.quantity}x</span> {it.name}{' '}
                              <span className="text-[10px] text-stone-400 uppercase">({it.department})</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono tabular-nums">
                        <div className="font-bold text-stone-900 dark:text-stone-100">
                          {ord.totalAmount.toLocaleString()} RWF
                        </div>
                        <div className="text-[10px] text-stone-400">
                          Incl. {ord.taxAmount.toLocaleString()} tax
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          {relatedTickets.map((t) => (
                            <div key={t.id} className="flex items-center gap-1.5 text-[11px]">
                              {t.department === 'kitchen' ? (
                                <ChefHat className="w-3 h-3 text-amber-600 shrink-0" />
                              ) : (
                                <Wine className="w-3 h-3 text-rose-600 shrink-0" />
                              )}
                              <span className="capitalize text-stone-600 dark:text-stone-300">
                                {t.department}:
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded font-bold text-[10px] uppercase ${
                                  t.status === 'ready' || t.status === 'released_to_service'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : t.status === 'preparing'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-stone-200 dark:bg-stone-800'
                                }`}
                              >
                                {t.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {ord.paymentStatus === 'verified' ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5" /> Settled
                          </span>
                        ) : (
                          <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1 text-[11px]">
                            <Clock className="w-3.5 h-3.5" /> Pending ({ord.paymentMethod?.replace('_', ' ') || 'Cashier'})
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {ord.status === 'delivered' ? (
                          <span className="text-stone-500 font-semibold text-[11px] flex items-center justify-end gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Delivered
                          </span>
                        ) : ord.status === 'ready' ? (
                          <button
                            onClick={() => confirmDelivery(ord.id, 'Samuel (Server)')}
                            className="px-3 py-1 rounded-lg bg-emerald-900 dark:bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] transition-colors"
                          >
                            Confirm Delivery
                          </button>
                        ) : (
                          <span className="text-stone-400 italic text-[11px]">
                            In Preparation
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
