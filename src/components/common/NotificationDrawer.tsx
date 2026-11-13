import React from 'react';
import { useSangira } from '../../context/SangiraContext';
import { X, Bell, CheckCheck, AlertTriangle, Info, Clock } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead } = useSangira();
  const [filter, setFilter] = React.useState<'all' | 'unread' | 'urgent'>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'urgent') return n.importance === 'urgent' || n.importance === 'high';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-[#121614] h-full shadow-2xl border-l border-stone-200 dark:border-stone-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">Notifications</h3>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
              ({notifications.filter((n) => !n.isRead).length} unread)
            </span>
          </div>
          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center p-2 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter controls */}
        <div className="px-4 py-2 bg-stone-50 dark:bg-stone-900/40 border-b border-stone-200 dark:border-stone-800 flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              filter === 'all'
                ? 'bg-emerald-800 text-white dark:bg-emerald-600'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-emerald-800 text-white dark:bg-emerald-600'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              filter === 'urgent'
                ? 'bg-amber-700 text-white dark:bg-amber-600'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            Urgent / High
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-stone-400 dark:text-stone-500 text-sm">
              <CheckCheck className="w-8 h-8 mx-auto mb-2 opacity-50 text-emerald-600" />
              <p>No notifications in this view.</p>
            </div>
          ) : (
            filtered.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-3 rounded-lg border text-sm transition-all cursor-pointer ${
                  notif.isRead
                    ? 'bg-white dark:bg-stone-900/30 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 opacity-75'
                    : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-stone-900 dark:text-stone-100 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {notif.importance === 'urgent' || notif.importance === 'high' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <h4 className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                      {notif.title}
                    </h4>
                  </div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {notif.timestamp}
                  </span>
                </div>
                <p className="mt-1 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {notif.description}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                  <span className="capitalize">{notif.department} Department</span>
                  {!notif.isRead && (
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">Click to mark read</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
