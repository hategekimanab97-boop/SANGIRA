import React from 'react';
import { useSangira } from '../../../context/SangiraContext';
import {
  Building2,
  ChefHat,
  Wine,
  Package,
  CreditCard,
  UserCheck,
  BedDouble,
  Sparkles,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const DepartmentsView: React.FC = () => {
  const { departments, toggleDepartmentStatus, activeBusiness } = useSangira();

  const getDeptIcon = (code: string) => {
    switch (code) {
      case 'management':
        return Building2;
      case 'kitchen':
        return ChefHat;
      case 'bar':
        return Wine;
      case 'stock':
        return Package;
      case 'cashier':
        return CreditCard;
      case 'service':
        return UserCheck;
      case 'front_desk':
      case 'housekeeping':
        return BedDouble;
      default:
        return Building2;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
            Operational Structure
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            Department Management
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure active operational modules for {activeBusiness.name}. Deactivating a department isolates its screens and queues.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {departments.map((dept) => {
          const Icon = getDeptIcon(dept.code);
          return (
            <div
              key={dept.id}
              className={`p-5 rounded-2xl border transition-all ${
                dept.isActive
                  ? 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121614] shadow-xs'
                  : 'border-stone-200/50 dark:border-stone-900 bg-stone-100/50 dark:bg-stone-950/40 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    dept.isActive
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <button
                  onClick={() => toggleDepartmentStatus(dept.id)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                    dept.isActive
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-stone-200 text-stone-600 border-stone-300 dark:bg-stone-800 dark:text-stone-400'
                  }`}
                >
                  {dept.isActive ? 'Active' : 'Deactivated'}
                </button>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">{dept.name}</h3>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                  {dept.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Manager</span>
                  <span className="font-medium text-stone-800 dark:text-stone-200 truncate block">{dept.managerName}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Staff</span>
                  <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{dept.staffCount} crew</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
