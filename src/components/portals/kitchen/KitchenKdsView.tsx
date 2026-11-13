import React, { useState } from 'react';
import { useSangira } from '../../../context/SangiraContext';
import {
  ChefHat,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  BookOpen,
  UserCheck,
  Plus,
  Send,
  X,
} from 'lucide-react';

export const KitchenKdsView: React.FC = () => {
  const {
    tickets,
    updateTicketStatus,
    recipes,
    stockItems,
    submitStockRequest,
    activeTab,
  } = useSangira();

  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [isStockReqOpen, setIsStockReqOpen] = useState(false);

  // Stock requisition local form
  const [reqItems, setReqItems] = useState([
    { itemId: 'stk-01', itemName: 'Prime Beef Tenderloin', requestedQty: 5, unit: 'kg' },
    { itemId: 'stk-02', itemName: 'Irish Potatoes (Musanze)', requestedQty: 15, unit: 'kg' },
  ]);
  const [reqNotes, setReqNotes] = useState('Dinner line replenishment for steak stations.');

  // Filter only Kitchen tickets
  const kitchenTickets = tickets.filter((t) => t.department === 'kitchen');

  const newTickets = kitchenTickets.filter((t) => t.status === 'new');
  const preppingTickets = kitchenTickets.filter((t) => t.status === 'accepted' || t.status === 'assigned' || t.status === 'preparing');
  const readyTickets = kitchenTickets.filter((t) => t.status === 'ready');
  const releasedTickets = kitchenTickets.filter((t) => t.status === 'released_to_service');

  const handleSendStockRequest = (e: React.FormEvent) => {
    e.preventDefault();
    submitStockRequest('kitchen', 'Chef Eric Bizimana (Executive Chef)', reqItems, reqNotes);
    setIsStockReqOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* KDS Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
            Kitchen Display System (KDS)
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-amber-600" />
            <span>Main Kitchen Order Flow</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time food order queue. Mark food ready when plated to notify servers for immediate table dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStockReqOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-emerald-900 dark:bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Package className="w-4 h-4" />
            <span>Request Stock</span>
          </button>
        </div>
      </div>

      {/* KDS Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Column 1: New & Incoming Orders */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-2 border-amber-500 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                1. New Incoming
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-amber-600">{newTickets.length}</span>
          </div>

          <div className="space-y-3">
            {newTickets.length === 0 ? (
              <div className="p-6 text-center text-stone-400 text-xs bg-stone-50 dark:bg-stone-900/20 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
                No new pending tickets
              </div>
            ) : (
              newTickets.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl border-2 border-amber-300 dark:border-amber-700/80 bg-amber-50/40 dark:bg-amber-950/20 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-base text-amber-950 dark:text-amber-200">
                      {t.tableNumber}
                    </span>
                    <span className="font-mono text-xs text-stone-500">{t.orderNumber}</span>
                  </div>

                  <div className="space-y-1.5 py-1 text-xs">
                    {t.items.map((it, idx) => (
                      <div key={idx} className="font-semibold text-stone-900 dark:text-stone-100">
                        <span className="text-amber-700 dark:text-amber-400 font-bold text-sm mr-1">
                          {it.quantity}x
                        </span>
                        {it.name}
                        {it.instructions && (
                          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-normal mt-0.5 italic">
                            Note: {it.instructions}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => updateTicketStatus(t.id, 'preparing', 'Chef Cyril Ntwari')}
                    className="w-full min-h-[44px] py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <ChefHat className="w-3.5 h-3.5" />
                    <span>Accept & Start Prep</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: In Preparation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-2 border-blue-500 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                2. On the Line / Cooking
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-blue-600">{preppingTickets.length}</span>
          </div>

          <div className="space-y-3">
            {preppingTickets.length === 0 ? (
              <div className="p-6 text-center text-stone-400 text-xs bg-stone-50 dark:bg-stone-900/20 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
                All food prepped
              </div>
            ) : (
              preppingTickets.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121614] space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-base text-stone-900 dark:text-stone-100">
                      {t.tableNumber}
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">{t.orderNumber}</span>
                  </div>

                  <div className="space-y-1.5 py-1 text-xs">
                    {t.items.map((it, idx) => (
                      <div key={idx} className="font-semibold text-stone-800 dark:text-stone-200">
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold mr-1">
                          {it.quantity}x
                        </span>
                        {it.name}
                        {it.instructions && (
                          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-normal italic">
                            {it.instructions}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] text-stone-500 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
                    <span>Chef: {t.assignedStaff || 'Brigade Line 1'}</span>
                    <span className="font-mono text-amber-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 8 mins
                    </span>
                  </div>

                  <button
                    onClick={() => updateTicketStatus(t.id, 'ready')}
                    className="w-full min-h-[44px] py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Food Plated & Ready</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Ready for Server Pickup & Released */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                3. Hot Pass / Ready for Pickup
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-700">{readyTickets.length}</span>
          </div>

          <div className="space-y-3">
            {readyTickets.length === 0 ? (
              <div className="p-6 text-center text-stone-400 text-xs bg-stone-50 dark:bg-stone-900/20 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
                Pass is clear
              </div>
            ) : (
              readyTickets.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-base text-emerald-950 dark:text-emerald-200">
                      {t.tableNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900 uppercase">
                      Ready
                    </span>
                  </div>

                  <div className="text-xs text-stone-700 dark:text-stone-300">
                    {t.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>

                  <div className="text-[11px] text-stone-500">
                    Server notified for table service.
                  </div>

                  <button
                    onClick={() => updateTicketStatus(t.id, 'released_to_service')}
                    className="w-full min-h-[44px] py-2 rounded-lg border border-emerald-600 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Hand to Server
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Requisition Drawer Modal */}
      {isStockReqOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#121614] rounded-2xl border border-stone-200 dark:border-stone-800 max-w-lg w-full max-h-[92dvh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
                <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                  Kitchen Stock Requisition
                </h3>
              </div>
              <button
                onClick={() => setIsStockReqOpen(false)}
                className="p-2 rounded text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendStockRequest} className="space-y-4 text-xs">
              <p className="text-stone-500">
                Submit ingredient requisition to Central Warehouse. The Stock Manager will inspect warehouse stock and issue items to the kitchen line.
              </p>

              <div className="space-y-2">
                {reqItems.map((it, idx) => (
                  <div
                    key={it.itemId}
                    className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/30 flex flex-wrap items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-stone-900 dark:text-stone-100">{it.itemName}</div>
                      <div className="text-[11px] text-stone-400 font-mono">SKU: {it.itemId}</div>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono shrink-0">
                      <input
                        type="number"
                        min="1"
                        value={it.requestedQty}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 1;
                          setReqItems((prev) =>
                            prev.map((p, i) => (i === idx ? { ...p, requestedQty: val } : p))
                          );
                        }}
                        className="w-16 px-2 py-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-right text-xs"
                      />
                      <span className="text-stone-500">{it.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Requisition Notes
                </label>
                <input
                  type="text"
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStockReqOpen(false)}
                  className="min-h-[44px] px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-4 py-2 rounded-lg bg-emerald-900 dark:bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Requisition to Warehouse</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
