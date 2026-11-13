import React, { useState } from 'react';
import { useSangira } from '../../../context/SangiraContext';
import {
  Settings,
  Building2,
  DollarSign,
  Percent,
  Clock,
  BedDouble,
  CheckCircle,
  Save,
} from 'lucide-react';

export const BusinessSettingsView: React.FC = () => {
  const { activeBusiness, setActiveBusiness } = useSangira();
  const [name, setName] = useState(activeBusiness.name);
  const [currency, setCurrency] = useState(activeBusiness.currency);
  const [taxRate, setTaxRate] = useState(activeBusiness.taxRate * 100);
  const [hasHotelModule, setHasHotelModule] = useState(activeBusiness.hasHotelModule);
  const [tableCount, setTableCount] = useState(activeBusiness.tableCount);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveBusiness({
      ...activeBusiness,
      name,
      currency,
      taxRate: taxRate / 100,
      hasHotelModule,
      tableCount,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
            Workspace Configuration
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            Business Settings & Modules
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure financial taxes, localized currency, and operational modules for {activeBusiness.name}.
          </p>
        </div>

        {isSaved && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-[#121614] rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-8 space-y-6 shadow-xs">
        {/* General Profile */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-2">
            General Business Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Workspace Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Operating Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              >
                <option value="RWF">RWF (Rwandan Franc)</option>
                <option value="USD">USD ($ United States Dollar)</option>
                <option value="KES">KES (Kenyan Shilling)</option>
                <option value="EUR">EUR (€ Euro)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Sales Tax / VAT Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 text-xs font-mono rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
                <Percent className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Active Dining Table Count
              </label>
              <input
                type="number"
                value={tableCount}
                onChange={(e) => setTableCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Modules Toggle */}
        <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
          <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
            Industry Modules Configuration
          </h3>

          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-400 shrink-0">
                <BedDouble className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Hotel Accommodations & Room Management
                </div>
                <div className="text-[11px] text-stone-500">
                  Enables front desk check-in/out folios, housekeeping inspection checklist, and room status grid.
                </div>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hasHotelModule}
                onChange={(e) => setHasHotelModule(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-stone-600 peer-checked:bg-emerald-700"></div>
            </label>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-emerald-900 dark:bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors flex items-center gap-2 shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
