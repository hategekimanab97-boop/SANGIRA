import React, { useState } from 'react';
import { useSangira } from '../../context/SangiraContext';
import { NotificationDrawer } from './NotificationDrawer';
import { ProfileDropdown } from './ProfileDropdown';
import {
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen = false, title }) => {
  const {
    role,
    activeBusiness,
    notifications,
  } = useSangira();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#FFFDF9]/95 dark:bg-[#0E1310]/95 backdrop-blur-md border-b border-[#D4AF37]/35 dark:border-[#D4AF37]/25 px-3 sm:px-4 md:px-6 py-2 flex items-center justify-between gap-2 sm:gap-4 min-h-[54px]">
        {/* Left: Hamburger & Brand Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-[#FAF6EB] dark:hover:bg-stone-800 border border-[#D4AF37]/40 dark:border-[#D4AF37]/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs group shrink-0"
              aria-label={isSidebarOpen ? 'Hide slide menu bar' : 'Show slide menu bar'}
              title={isSidebarOpen ? 'Slide hide menu bar' : 'Slide open menu bar'}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-4 h-4 text-[#B89320] dark:text-[#D4AF37] group-hover:scale-105 transition-transform" />
              ) : (
                <PanelLeftOpen className="w-4 h-4 text-[#B89320] dark:text-[#D4AF37] group-hover:scale-105 transition-transform" />
              )}
              <span className="hidden sm:inline text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                {isSidebarOpen ? 'Hide Menu' : 'Menu'}
              </span>
            </button>
          )}

          <div className="flex items-baseline gap-1.5 sm:gap-2 min-w-0">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-emerald-950 dark:text-stone-50 flex items-center shrink-0">
              SANGIRA
            </span>
            <span className="hidden sm:inline-block text-xs text-stone-500 dark:text-stone-400 font-medium truncate max-w-[120px] md:max-w-[200px] lg:max-w-[320px]">
              · {role === 'SYSTEM_ADMIN' ? 'Platform Administration' : activeBusiness.name}
            </span>
          </div>
        </div>

        {/* Center: Contextual View Title */}
        {title && (
          <div className="hidden lg:flex items-center text-xs font-semibold text-stone-700 dark:text-stone-300">
            <span>{title}</span>
          </div>
        )}

        {/* Right: Notifications Button + Personal Profile Avatar Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsNotifOpen(true)}
            className="relative min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0 cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            )}
          </button>

          <ProfileDropdown onOpenNotifications={() => setIsNotifOpen(true)} />
        </div>
      </header>

      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
