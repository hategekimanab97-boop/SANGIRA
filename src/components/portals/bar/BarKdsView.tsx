import React, { useState } from 'react';
import { useSangira } from '../../../context/SangiraContext';
import {
  Wine,
  Sparkles,
  Clock,
  CheckCircle,
  Package,
  BookOpen,
  Send,
  X,
  Droplet,
} from 'lucide-react';

export const BarKdsView: React.FC = () => {
  const {
    tickets,
    updateTicketStatus,
    recipes,
    submitStockRequest,
    stockItems,
  } = useSangira();

  const [isSupplyReqOpen, setIsSupplyReqOpen] = useState(false);
  const [selectedDrinkRecipe, setSelectedDrinkRecipe] = useState<string | null>(null);

  // Bar Requisition items
  const [barReqItems, setBarReqItems] = useState([
    { itemId: 'stk-03', itemName: 'Fresh Organic Lemons', requestedQty: 3, unit: 'kg' },
    { itemId: 'stk-04', itemName: 'Fresh Mint Leaves', requestedQty: 1.5, unit: 'kg' },
    { itemId: 'stk-06', itemName: 'Club Soda / Sparkling Water', requestedQty: 2, unit: 'crate' },
  ]);

  const barTickets = tickets.filter((t) => t.department === 'bar');

  const newBarTickets = barTickets.filter((t) => t.status === 'new');
  const preppingBarTickets = barTickets.filter(
    (t) => t.status === 'accepted' || t.status === 'assigned' || t.status === 'preparing'
  );
  const readyBarTickets = barTickets.filter((t) => t.status === 'ready');

  const handleSendBarRequest = (e: React.FormEvent) => {
    e.preventDefault();
    submitStockRequest(
      'bar',
      'Sandrine Umuhoza (Lead Bartender)',
      barReqItems,
      'Restock for terrace cocktail hours.'
    );
    setIsSupplyReqOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <span className="text-[11px] font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider">
            Bar & Mixology Operations
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Wine className="w-6 h-6 text-rose-600" />
            <span>Terrace & Cocktail Bar Queue</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Dedicated beverage queue for craft cocktails, wines, and fresh juices. Keep bar tickets isolated from food line.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSupplyReqOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-emerald-900 dark:bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Package className="w-4 h-4" />
            <span>Request Bar Supplies</span>
          </button>
        </div>
      </div>

      {/* Bar Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* New Drink Orders */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-2 border-rose-500 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                1. New Drink Orders
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-rose-600">{newBarTickets.length}</span>
          </div>

          <div className="space-y-3">
            {newBarTickets.length === 0 ? (
              <div className="p-6 text-center text-stone-400 text-xs bg-stone-50 dark:bg-stone-900/20 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
                No pending drink orders
              </div>
            ) : (
              newBarTickets.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-base text-rose-950 dark:text-rose-200">
                      {t.tableNumber}
                    </span>
                    <span className="font-mono text-xs text-stone-500">{t.orderNumber}</span>
                  </div>

                  <div className="space-y-1.5 py-1 text-xs">
                    {t.items.map((it, idx) => (
                      <div key={idx} className="font-semibold text-stone-900 dark:text-stone-100">
                        <span className="text-rose-700 dark:text-rose-400 font-bold text-sm mr-1">
                          {it.quantity}x
                        </span>
                        {it.name}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => updateTicketStatus(t.id, 'preparing', 'Sandrine (Bartender)')}
                    className="w-full min-h-[44px] py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Start Mixing</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mixing & Pouring */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-2 border-purple-500 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                2. Mixing & Pouring
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-purple-600">{preppingBarTickets.length}</span>
          </div>

          <div className="space-y-3">
            {preppingBarTickets.length === 0 ? (
              <div className="p-6 text-center text-stone-400 text-xs bg-stone-50 dark:bg-stone-900/20 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
                Bar station clear
              </div>
            ) : (
              preppingBarTickets.map((t) => (
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
                        <span className="text-rose-700 dark:text-rose-400 font-bold mr-1">
                          {it.quantity}x
                        </span>
                        {it.name}
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] text-stone-500 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
                    <span>Bartender: {t.assignedStaff || 'Station A'}</span>
                    <span className="font-mono text-purple-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> In shaker
                    </span>
                  </div>

                  <button
                    onClick={() => updateTicketStatus(t.id, 'ready')}
                    className="w-full min-h-[44px] py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Drinks Ready for Server</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ready on Bar Counter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                3. Bar Counter / Service Pickup
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-700">{readyBarTickets.length}</span>
          </div>

          <div className="space-y-3">
            {readyBarTickets.length === 0 ? (
              <div className="p-6 text-center text-stone-400 text-xs bg-stone-50 dark:bg-stone-900/20 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
                No drinks waiting
              </div>
            ) : (
              readyBarTickets.map((t) => (
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
                    Glassware polished, garnished, chilled.
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

      {/* Bar Supplies Requisition Modal */}
      {isSupplyReqOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#121614] rounded-2xl border border-stone-200 dark:border-stone-800 max-w-lg w-full max-h-[92dvh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-rose-700" />
                <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                  Bar & Cocktail Supplies Requisition
                </h3>
              </div>
              <button
                onClick={() => setIsSupplyReqOpen(false)}
                className="p-2 rounded text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendBarRequest} className="space-y-4 text-xs">
              <p className="text-stone-500">
                Request fresh garnishes, soda crates, and spirits from the central warehouse.
              </p>

              <div className="space-y-2">
                {barReqItems.map((it, idx) => (
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
                          setBarReqItems((prev) =>
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

              <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSupplyReqOpen(false)}
                  className="min-h-[44px] px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-4 py-2 rounded-lg bg-emerald-900 dark:bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Requisition to Stock Manager</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
