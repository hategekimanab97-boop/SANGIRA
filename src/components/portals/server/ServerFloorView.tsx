import React, { useState } from 'react';
import { useSangira } from '../../../context/SangiraContext';
import {
  UserCheck,
  CheckCircle,
  Clock,
  ChefHat,
  Wine,
  AlertCircle,
  Utensils,
  Smartphone,
} from 'lucide-react';

export const ServerFloorView: React.FC = () => {
  const {
    orders,
    tickets,
    confirmDelivery,
    employees,
    shifts,
    clockInShift,
    clockOutShift,
  } = useSangira();

  const serverEmployee = employees.find((e) => e.roles.includes('SERVER')) || employees[7];
  const isOnDuty = serverEmployee.shiftStatus === 'on_duty';

  // Ready orders waiting for floor delivery
  const readyForDelivery = orders.filter((o) => o.status === 'ready');
  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Shift status card */}
      <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121614] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider">
            Floor Staff Workspace
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            <span>Server: {serverEmployee.fullName}</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Shift Status:{' '}
            <strong className={isOnDuty ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-400'}>
              {isOnDuty ? 'On Duty · Assigned to Dining Tables' : 'Off Duty'}
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOnDuty ? (
            <button
              onClick={() => clockOutShift(serverEmployee.id)}
              className="px-4 py-2 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
            >
              End Service Shift
            </button>
          ) : (
            <button
              onClick={() => clockInShift(serverEmployee.id, serverEmployee.fullName, 'Dining Room & Service', 'SERVER')}
              className="px-4 py-2 rounded-lg bg-emerald-900 dark:bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors"
            >
              Clock In Shift
            </button>
          )}
        </div>
      </div>

      {/* Urgent Dispatch Section: Ready Food & Drinks */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              Orders Ready for Table Delivery ({readyForDelivery.length})
            </h3>
          </div>
          <span className="text-xs text-stone-500">Pick up from pass immediately</span>
        </div>

        {readyForDelivery.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121614] text-center text-xs text-stone-400 space-y-1">
            <CheckCircle className="w-8 h-8 text-emerald-600/50 mx-auto mb-2" />
            <p className="font-semibold text-stone-700 dark:text-stone-300">All ready dishes have been served!</p>
            <p>New orders will alert here as soon as Kitchen or Bar marks them ready.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {readyForDelivery.map((ord) => {
              const orderTickets = tickets.filter((t) => t.orderId === ord.id);
              return (
                <div
                  key={ord.id}
                  className="p-5 rounded-2xl border-2 border-emerald-400 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-emerald-900 dark:text-emerald-300">
                        {ord.orderNumber}
                      </span>
                      <h4 className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-0.5">
                        {ord.tableNumber}
                      </h4>
                      <div className="text-xs text-stone-500">Guest: {ord.customerName || 'Dine-in'}</div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-200 dark:bg-emerald-900 text-emerald-950 dark:text-emerald-200">
                      Plated & Chilled
                    </span>
                  </div>

                  {/* Items to deliver */}
                  <div className="p-3 bg-white dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2 text-xs">
                    <span className="text-[10px] font-bold uppercase text-stone-400">Items to Deliver:</span>
                    <div className="divide-y divide-stone-100 dark:divide-stone-800">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="py-1.5 flex items-center justify-between">
                          <span className="font-semibold text-stone-900 dark:text-stone-100">
                            {it.quantity}x {it.name}
                          </span>
                          <span className="capitalize text-[11px] text-stone-500 font-mono">
                            {it.department}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Confirmation Button */}
                  <button
                    onClick={() => confirmDelivery(ord.id, serverEmployee.fullName)}
                    className="w-full min-h-[48px] py-3 rounded-xl bg-emerald-900 dark:bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Confirm Table Delivery Completed</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Table Orders overview */}
      <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121614] shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
          All Active Floor Tables ({activeOrders.length})
        </h3>

        <div className="space-y-2">
          {activeOrders.map((ord) => (
            <div
              key={ord.id}
              className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 flex flex-col xs:flex-row xs:items-center justify-between gap-2 text-xs"
            >
              <div className="min-w-0">
                <span className="font-bold text-stone-900 dark:text-stone-100">{ord.tableNumber}</span>
                <span className="text-stone-400 ml-2 font-mono">{ord.orderNumber}</span>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                </div>
              </div>

              <span className="self-start xs:self-auto shrink-0 capitalize px-2 py-0.5 rounded font-bold text-[10px] bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                {ord.status.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
