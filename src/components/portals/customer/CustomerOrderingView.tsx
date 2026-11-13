import React, { useState, useMemo } from 'react';
import { useSangira } from '../../../context/SangiraContext';
import { useLanguage } from '../../../context/LanguageContext';
import { MenuItem } from '../../../types';
import {
  ShoppingBag,
  Plus,
  Minus,
  Clock,
  Sparkles,
  CheckCircle,
  CreditCard,
  Smartphone,
  Search,
  ArrowRight,
  X,
  ChefHat,
  Wine,
  UtensilsCrossed,
  Cake,
  Eye,
  Radio,
  BellRing,
  AlertTriangle,
  AlertOctagon,
  XCircle,
  LogOut,
  Trash2,
} from 'lucide-react';

export const CustomerOrderingView: React.FC = () => {
  const { t, translateDescription } = useLanguage();
  const {
    activeBusiness,
    menuItems,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    placeOrder,
    cancelOrder,
    orders,
    activeTab,
    setActiveTab,
  } = useSangira();

  const [selectedTable, setSelectedTable] = useState('Table 4');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [customerName, setCustomerName] = useState('Guest Diner');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mtn_momo' | 'airtel_money' | 'cash' | 'bank_card'>('mtn_momo');
  const [specialInstruction, setSpecialInstruction] = useState('');
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [modalQty, setModalQty] = useState(1);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string | null>(null);
  const [orderNotifyActive, setOrderNotifyActive] = useState<boolean>(false);
  const [cartToast, setCartToast] = useState<string | null>(null);
  const [submittedOrderNotification, setSubmittedOrderNotification] = useState<{
    orderId: string;
    orderNumber: string;
    tableNumber: string;
    totalAmount: number;
    itemCount: number;
    paymentMethod: string;
  } | null>(null);

  // Emergency Cancellation States
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState('Urgent emergency - leaving hotel immediately');
  const [customCancelNotes, setCustomCancelNotes] = useState('');
  const [cancelToastMessage, setCancelToastMessage] = useState<string | null>(null);

  // Active table orders
  const activeTableOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.tableNumber === selectedTable || (lastPlacedOrderId && o.id === lastPlacedOrderId)
    );
  }, [orders, selectedTable, lastPlacedOrderId]);

  const activeOrdersInPrep = useMemo(() => {
    return activeTableOrders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  }, [activeTableOrders]);

  const hasActiveOrders = activeOrdersInPrep.length > 0;

  // Latest placed order for tracking
  const latestOrder = (lastPlacedOrderId ? orders.find((o) => o.id === lastPlacedOrderId) : null) || activeTableOrders.find((o) => o.status !== 'cancelled') || activeTableOrders[0] || orders[0];

  const handleConfirmCancel = () => {
    if (!latestOrder) return;
    const fullReason = customCancelNotes.trim()
      ? `${selectedCancelReason}: ${customCancelNotes.trim()}`
      : selectedCancelReason;

    cancelOrder(latestOrder.id, fullReason);
    setIsCancelModalOpen(false);
    setCancelToastMessage(`Order #${latestOrder.orderNumber} was cancelled. Kitchen and Bar production lines were immediately stopped. No charges apply.`);
    setSubmittedOrderNotification(null);
    setOrderNotifyActive(false);
  };

  const handleAddToCart = (item: MenuItem, qty = 1, note?: string) => {
    addToCart(item, qty, note);
    setCartToast(`Added ${qty}x ${item.name} to cart`);
    setTimeout(() => {
      setCartToast(null);
    }, 2500);
  };

  // Cart item selection and individual / batch removal state
  const [selectedCartItemIds, setSelectedCartItemIds] = useState<string[]>([]);

  const handleToggleSelectCartItem = (itemId: string) => {
    setSelectedCartItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSelectAllCartItems = () => {
    if (selectedCartItemIds.length === cart.length) {
      setSelectedCartItemIds([]);
    } else {
      setSelectedCartItemIds(cart.map((c) => c.menuItem.id));
    }
  };

  const handleRemoveSingleItem = (itemId: string, itemName: string) => {
    removeFromCart(itemId);
    setSelectedCartItemIds((prev) => prev.filter((id) => id !== itemId));
    setCartToast(`Removed "${itemName}" from cart`);
    setTimeout(() => {
      setCartToast(null);
    }, 2500);
  };

  const handleRemoveSelectedItems = () => {
    if (selectedCartItemIds.length === 0) return;
    const count = selectedCartItemIds.length;
    selectedCartItemIds.forEach((id) => removeFromCart(id));
    setSelectedCartItemIds([]);
    setCartToast(`Removed ${count} item${count > 1 ? 's' : ''} from cart`);
    setTimeout(() => {
      setCartToast(null);
    }, 2500);
  };

  const filteredMenuItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menuItems.filter((item) => {
      const matchesCat =
        selectedCategory === 'all' ||
        (selectedCategory === 'food' && item.department === 'kitchen' && item.category !== 'dessert') ||
        (selectedCategory === 'drinks' && item.department === 'bar') ||
        (selectedCategory === 'dessert' && item.category === 'dessert') ||
        item.category === selectedCategory;
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [menuItems, selectedCategory, search]);

  const categoryCounts = useMemo(() => ({
    all: menuItems.length,
    food: menuItems.filter((i) => i.department === 'kitchen' && i.category !== 'dessert').length,
    drinks: menuItems.filter((i) => i.department === 'bar').length,
    dessert: menuItems.filter((i) => i.category === 'dessert').length,
  }), [menuItems]);

  const cartTotal = cart.reduce((acc, c) => acc + c.menuItem.price * c.quantity, 0);
  const taxAmount = Math.round(cartTotal * activeBusiness.taxRate);
  const grandTotal = cartTotal + taxAmount;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    const ord = placeOrder(selectedTable, cart, paymentMethod, customerName, customerEmail);
    setLastPlacedOrderId(ord.id);
    setOrderNotifyActive(true);
    setSubmittedOrderNotification({
      orderId: ord.id,
      orderNumber: ord.orderNumber,
      tableNumber: ord.tableNumber,
      totalAmount: ord.totalAmount,
      itemCount: ord.items.reduce((acc, it) => acc + it.quantity, 0),
      paymentMethod,
    });
    setActiveTab('track');
  };

  return (
    <div className="min-h-dvh bg-[#FAF6EB] dark:bg-[#0A0E0C] text-stone-900 dark:text-stone-100 pb-36 md:pb-12">
      {/* Branded Restaurant Header */}
      <div className="bg-[#0E382B] text-white px-4 sm:px-6 py-6 md:py-8 border-b border-[#D4AF37]/40 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF37]">
              {t('customer.contactlessTitle')}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5 text-stone-50">
              {activeBusiness.name}
            </h1>
            <p className="text-xs text-stone-300 mt-1">
              {t('customer.contactlessSub')}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
            {/* Table lock indicator */}
            <div className="flex items-center gap-2 bg-black/40 px-3.5 py-2 rounded-xl border border-[#D4AF37]/40 text-xs">
              <span className="text-stone-300">{t('customer.orderingFor')}</span>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="bg-transparent font-bold text-[#F3DF95] focus:outline-hidden cursor-pointer"
              >
                {Array.from({ length: activeBusiness.tableCount || 16 }, (_, i) => `${t('customer.table')} ${i + 1}`).map((tbl) => (
                  <option key={tbl} value={tbl} className="bg-stone-900 text-stone-100">
                    {tbl}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Live Order Tracking Notification Banner — Appears on screen after submitting order to kitchen & bar */}
      {submittedOrderNotification && latestOrder && latestOrder.status !== 'cancelled' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="bg-[#0E382B] text-white p-3.5 sm:p-4 rounded-2xl border-2 border-[#D4AF37] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              {/* Pulsing live radar beacon */}
              <div className="relative flex h-3 w-3 mt-1 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-90"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white"></span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] bg-black/40 px-2 py-0.5 rounded-md border border-[#D4AF37]/30">
                    Live Preparation Active
                  </span>
                  <span className="font-mono font-bold text-xs text-[#F3DF95]">
                    Order #{submittedOrderNotification.orderNumber}
                  </span>
                  <span className="text-stone-300 text-xs">
                    · {submittedOrderNotification.tableNumber}
                  </span>
                </div>
                <p className="text-xs text-stone-200 mt-1 font-medium leading-relaxed">
                  Payment approved! Kitchen & Bar lines are actively preparing your order.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {activeTab !== 'track' ? (
                <button
                  onClick={() => setActiveTab('track')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#C59F2A] text-stone-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Radio className="w-3.5 h-3.5 text-stone-950" />
                  <span>Track Live Order ➔</span>
                </button>
              ) : (
                <span className="px-3 py-1 rounded-xl bg-white/10 text-[#F3DF95] border border-[#D4AF37]/30 text-xs font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Viewing Live Tracker</span>
                </span>
              )}
              <button
                onClick={() => setSubmittedOrderNotification(null)}
                className="p-1.5 text-stone-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/10"
                aria-label="Dismiss tracking notification"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Toast Notification (Brief & subtle when adding dishes) */}
      {cartToast && (
        <div className="fixed top-16 right-4 z-50 animate-in fade-in slide-in-from-right-2 duration-200">
          <div className="bg-stone-900/90 text-[#FAF6EB] border border-[#D4AF37]/50 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
            <span>{cartToast}</span>
          </div>
        </div>
      )}

      {/* Main Tab 1: Menu Catalog */}
      {activeTab === 'menu' && (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Category Filter & Search */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
            {/* Redesigned Category Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x -mx-1 px-1">
              {[
                {
                  id: 'all',
                  label: t('customer.categories.all'),
                  icon: UtensilsCrossed,
                  count: categoryCounts.all,
                  accentColor: 'text-[#D4AF37]',
                },
                {
                  id: 'food',
                  label: t('customer.categories.food'),
                  icon: ChefHat,
                  count: categoryCounts.food,
                  accentColor: 'text-amber-500',
                },
                {
                  id: 'drinks',
                  label: t('customer.categories.drinks'),
                  icon: Wine,
                  count: categoryCounts.drinks,
                  accentColor: 'text-rose-400',
                },
                {
                  id: 'dessert',
                  label: t('customer.categories.dessert'),
                  icon: Cake,
                  count: categoryCounts.dessert,
                  accentColor: 'text-pink-400',
                },
              ].map((c) => {
                const IconComponent = c.icon;
                const isSelected = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`group relative flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer snap-start select-none border ${
                      isSelected
                        ? 'bg-[#0E382B] text-white border-[#D4AF37] shadow-md shadow-[#0E382B]/20 scale-[1.02]'
                        : 'bg-white/80 dark:bg-stone-900/80 hover:bg-white dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border-[#D4AF37]/25 hover:border-[#D4AF37]/60 shadow-xs'
                    }`}
                  >
                    {/* Category Icon */}
                    <span
                      className={`p-1 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-[#D4AF37]/20 text-[#F3DF95]'
                          : `bg-stone-100 dark:bg-stone-800 ${c.accentColor} group-hover:bg-[#D4AF37]/15 group-hover:text-[#D4AF37]`
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110" />
                    </span>

                    {/* Label */}
                    <span className={`font-semibold tracking-tight ${isSelected ? 'text-[#F3DF95]' : ''}`}>
                      {c.label}
                    </span>

                    {/* Count Badge */}
                    <span
                      className={`ml-0.5 text-[10px] sm:text-xs font-mono font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                        isSelected
                          ? 'bg-[#D4AF37] text-stone-950 shadow-xs'
                          : 'bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400 group-hover:bg-[#D4AF37]/20 group-hover:text-[#D4AF37]'
                      }`}
                    >
                      {c.count}
                    </span>

                    {/* Subtle Active Indicator Dot */}
                    {isSelected && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-xs" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-64 min-w-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder={t('customer.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-[#D4AF37]/40 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] shadow-xs transition-colors"
              />
            </div>
          </div>

          {/* Menu Items Grid: 1-col phone, 2-col tablet, 3-col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenuItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[#D4AF37]/35 dark:border-[#D4AF37]/25 bg-[#FFFDF9] dark:bg-[#121815] flex flex-col justify-between overflow-hidden shadow-xs hover:border-[#D4AF37] hover:shadow-md transition-all group"
              >
                {/* Product Photography Header */}
                <div
                  onClick={() => {
                    setSelectedItemForModal(item);
                    setModalQty(1);
                  }}
                  className="relative aspect-16/10 overflow-hidden bg-stone-900 cursor-pointer"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900 text-stone-400">
                      <UtensilsCrossed className="w-6 h-6 text-[#D4AF37] mb-1" />
                      <span className="text-[10px]">Photo Preview</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Sold Out Scrim Overlay */}
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/65 backdrop-blur-2xs flex items-center justify-center z-10">
                      <span className="px-3 py-1 rounded-lg bg-rose-600/90 text-white font-bold text-xs tracking-wider uppercase border border-white/20 shadow-lg flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Sold Out</span>
                      </span>
                    </div>
                  )}

                  {/* Department Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-20">
                    <span className="bg-black/60 backdrop-blur-md text-[#FAF6EB] font-medium px-2 py-0.5 rounded-md text-[10px] border border-white/10 flex items-center gap-1">
                      {item.department === 'kitchen' ? (
                        <ChefHat className="w-3 h-3 text-[#D4AF37]" />
                      ) : (
                        <Wine className="w-3 h-3 text-rose-400" />
                      )}
                      <span className="capitalize">{item.department}</span>
                    </span>
                  </div>

                  {/* Inspect Photo Pill */}
                  <div className="absolute top-2.5 right-2.5 z-20">
                    <span className="bg-black/60 backdrop-blur-md text-[#D4AF37] p-1 rounded-md text-[10px] border border-[#D4AF37]/40 flex items-center justify-center opacity-85 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Eye className="w-3 h-3" />
                    </span>
                  </div>

                  {/* Price in Photo Scrim */}
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-end justify-between text-white z-20">
                    <span className="font-mono font-bold text-sm text-[#F3DF95] tabular-nums drop-shadow-sm">
                      {item.price.toLocaleString()} {t('common.rwf')}
                    </span>
                    <span className="text-[10px] bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-stone-200">
                      {item.prepTimeMinutes} mins
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div
                    onClick={() => {
                      setSelectedItemForModal(item);
                      setModalQty(1);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-[#B89320] transition-colors">
                        {translateDescription(item.name)}
                      </h3>
                      {!item.isAvailable && (
                        <span className="shrink-0 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                          Unavailable
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                      {translateDescription(item.description)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#D4AF37]/20 dark:border-stone-800/80 text-xs">
                    <button
                      onClick={() => {
                        setSelectedItemForModal(item);
                        setModalQty(1);
                      }}
                      className="text-[11px] text-[#8B6E15] dark:text-[#E6C665] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Check Details</span>
                    </button>

                    {item.isAvailable ? (
                      <button
                        onClick={() => handleAddToCart(item, 1)}
                        className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-[#0E382B] hover:bg-[#154636] text-[#FAF6EB] border border-[#D4AF37]/60 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-[#F3DF95]">{t('customer.addToOrder')}</span>
                      </button>
                    ) : (
                      <span className="min-h-[40px] px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800/80 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700 font-semibold text-xs flex items-center gap-1.5 cursor-not-allowed">
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Sold Out</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Floating Mobile Quick Checkout Pill */}
          {cart.length > 0 && (
            <div className="md:hidden fixed bottom-16 left-3 right-3 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="bg-[#0E382B] text-white p-3 rounded-2xl border border-[#D4AF37] shadow-2xl flex items-center justify-between gap-3 backdrop-blur-md">
                <div className="min-w-0">
                  <div className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-wider">
                    {cart.reduce((a, b) => a + b.quantity, 0)} {cart.reduce((a, b) => a + b.quantity, 0) === 1 ? 'item' : 'items'} in order
                  </div>
                  <div className="font-mono font-bold text-sm text-[#F3DF95] tabular-nums truncate">
                    {grandTotal.toLocaleString()} RWF
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('cart')}
                  className="px-4 py-2 min-h-[44px] rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-stone-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer shrink-0 transition-colors"
                >
                  <span>View Cart</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Tab 2: Shopping Cart & Checkout */}
      {activeTab === 'cart' && (
        <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
          <div className="bg-[#FFFDF9] dark:bg-[#121614] rounded-2xl border border-[#D4AF37]/35 dark:border-stone-800 p-4 sm:p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/20 dark:border-stone-800 pb-3 gap-2">
              <div>
                <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>{t('customer.yourTableOrder')} ({selectedTable})</span>
                  {cart.length > 0 && (
                    <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-[#0E382B] text-[#F3DF95] border border-[#D4AF37]/40">
                      {cart.reduce((a, b) => a + b.quantity, 0)} {cart.reduce((a, b) => a + b.quantity, 0) === 1 ? 'dish' : 'dishes'}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-stone-500">{activeBusiness.name}</p>
              </div>

              {cart.length > 0 && (
                <div className="flex items-center gap-2.5 flex-wrap">
                  {selectedCartItemIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleRemoveSelectedItems}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      title="Remove selected item(s)"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Remove Selected ({selectedCartItemIds.length})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      clearCart();
                      setSelectedCartItemIds([]);
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-semibold cursor-pointer"
                  >
                    {t('customer.clearCart')}
                  </button>
                </div>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-400 space-y-3">
                <ShoppingBag className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-700" />
                <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">{t('customer.cartEmpty')}</p>
                <button
                  onClick={() => setActiveTab('menu')}
                  className="px-4 py-2 rounded-lg bg-[#0E382B] text-[#F3DF95] border border-[#D4AF37]/60 font-semibold text-xs cursor-pointer"
                >
                  {t('customer.browseFood')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleCheckout} className="space-y-6 text-xs">
                {/* Select All Toggle Bar (when multiple items exist) */}
                {cart.length > 1 && (
                  <div className="flex items-center justify-between px-3 py-1.5 bg-[#FAF6EB]/90 dark:bg-stone-900/60 rounded-xl border border-[#D4AF37]/25 text-[11px] text-stone-600 dark:text-stone-400">
                    <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-stone-900 dark:hover:text-stone-200">
                      <input
                        type="checkbox"
                        checked={selectedCartItemIds.length === cart.length && cart.length > 0}
                        onChange={handleSelectAllCartItems}
                        className="w-3.5 h-3.5 rounded text-[#0E382B] focus:ring-[#D4AF37] border-stone-300 dark:border-stone-700 accent-[#0E382B] cursor-pointer"
                      />
                      <span>Select all items ({cart.length})</span>
                    </label>
                    {selectedCartItemIds.length > 0 && (
                      <span className="text-[#8B6E15] dark:text-[#E6C665] font-bold">
                        {selectedCartItemIds.length} of {cart.length} selected
                      </span>
                    )}
                  </div>
                )}

                {/* Cart Items List */}
                <div className="divide-y divide-[#D4AF37]/20 dark:divide-stone-800 space-y-1">
                  {cart.map((c) => {
                    const isSelected = selectedCartItemIds.includes(c.menuItem.id);
                    return (
                      <div
                        key={c.menuItem.id}
                        className={`p-3 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#D4AF37]/15 dark:bg-[#D4AF37]/20 border border-[#D4AF37]/50 shadow-xs'
                            : 'hover:bg-stone-50/80 dark:hover:bg-stone-900/40'
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                          {/* Item Select Checkbox */}
                          <label className="flex items-center cursor-pointer pt-1 sm:pt-0 shrink-0" title="Select item to remove separately">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectCartItem(c.menuItem.id)}
                              className="w-4 h-4 rounded text-[#0E382B] focus:ring-[#D4AF37] border-stone-300 dark:border-stone-700 accent-[#0E382B] cursor-pointer"
                            />
                          </label>

                          {/* Optional Thumbnail Image */}
                          {c.menuItem.imageUrl && (
                            <img
                              src={c.menuItem.imageUrl}
                              alt={c.menuItem.name}
                              className="w-12 h-12 rounded-lg object-cover border border-[#D4AF37]/30 shrink-0 shadow-2xs"
                            />
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                              {translateDescription(c.menuItem.name)}
                            </div>
                            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono flex items-center gap-2 flex-wrap">
                              <span>{c.menuItem.price.toLocaleString()} {t('common.rwf')} each</span>
                              <span>·</span>
                              <span className="capitalize">{c.menuItem.department}</span>
                              {c.specialInstructions && (
                                <span className="text-[#8B6E15] dark:text-[#E6C665] italic truncate max-w-xs">
                                  Note: "{c.specialInstructions}"
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Controls: Stepper, Line Total, and Individual Trash Button */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-7 sm:pl-0">
                          {/* Quantity Stepper */}
                          <div className="flex items-center gap-1.5 bg-[#FAF6EB] dark:bg-stone-800 p-1 rounded-lg border border-[#D4AF37]/30">
                            <button
                              type="button"
                              onClick={() => {
                                if (c.quantity <= 1) {
                                  handleRemoveSingleItem(c.menuItem.id, c.menuItem.name);
                                } else {
                                  updateCartQuantity(c.menuItem.id, -1);
                                }
                              }}
                              className="p-1 rounded text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 cursor-pointer"
                              title={c.quantity <= 1 ? "Remove item" : "Decrease quantity"}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono font-bold px-2 text-stone-900 dark:text-stone-100">{c.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(c.menuItem.id, 1)}
                              className="p-1 rounded text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 cursor-pointer"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Line Total */}
                          <span className="font-mono font-bold text-[#8B6E15] dark:text-[#E6C665] w-20 text-right tabular-nums">
                            {(c.menuItem.price * c.quantity).toLocaleString()} {t('common.rwf')}
                          </span>

                          {/* Individual Item Separate Remove Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveSingleItem(c.menuItem.id, c.menuItem.name)}
                            className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/60 transition-colors cursor-pointer shrink-0"
                            title={`Remove "${c.menuItem.name}" from cart`}
                            aria-label={`Remove ${c.menuItem.name} from cart`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotal Calculation */}
                <div className="p-4 rounded-xl bg-[#FAF6EB] dark:bg-stone-900/40 border border-[#D4AF37]/30 space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>{t('customer.subtotal')}:</span>
                    <span>{cartTotal.toLocaleString()} {t('common.rwf')}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>{t('customer.vat')}:</span>
                    <span>{taxAmount.toLocaleString()} {t('common.rwf')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-emerald-950 dark:text-[#E6C665] pt-2 border-t border-[#D4AF37]/20">
                    <span>{t('customer.total')}:</span>
                    <span>{grandTotal.toLocaleString()} {t('common.rwf')}</span>
                  </div>
                </div>

                {/* Guest Name, Email Receipt & Payment Method */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        {t('customer.guestName')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('customer.namePlaceholder')}
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#D4AF37]/40 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Email for Digital Receipt (Optional · Resend)
                      </label>
                      <input
                        type="email"
                        placeholder="guest@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#D4AF37]/40 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      {t('customer.settlementMethod')}
                    </label>
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'mtn_momo', label: 'MTN MoMo', dot: 'bg-yellow-500' },
                        { id: 'airtel_money', label: 'Airtel Money', dot: 'bg-red-600' },
                        { id: 'cash', label: 'Cash at Table', dot: 'bg-emerald-600' },
                        { id: 'bank_card', label: 'POS Card', dot: 'bg-blue-600' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`min-h-[44px] p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            paymentMethod === m.id
                              ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#8B6E15] dark:text-[#E6C665] ring-1 ring-[#D4AF37]'
                              : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <span className={`w-2 h-2 rounded-full ${m.dot}`}></span>
                            <span>{m.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#0E382B] hover:bg-[#154636] text-[#FAF6EB] border border-[#D4AF37]/60 font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="text-[#F3DF95]">{t('customer.submitOrder')} · {grandTotal.toLocaleString()} {t('common.rwf')}</span>
                  <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Main Tab 3: Live Order Progress Tracker */}
      {activeTab === 'track' && !latestOrder && (
        <div className="max-w-md mx-auto p-6 sm:p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#0E382B]/10 dark:bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center mx-auto text-[#D4AF37]">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              No Active Orders Yet
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
              Select dishes and beverages from our menu catalog to start live step-by-step preparation tracking.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('menu')}
            className="px-5 py-2.5 rounded-xl bg-[#0E382B] hover:bg-[#144737] text-[#FAF6EB] font-bold text-xs border border-[#D4AF37] shadow-sm cursor-pointer transition-colors"
          >
            Browse Menu Catalog
          </button>
        </div>
      )}

      {activeTab === 'track' && latestOrder && (
        <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Multiple Orders Selector if table placed multiple rounds */}
          {activeTableOrders.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-semibold text-stone-500 shrink-0">Your Table Orders:</span>
              {activeTableOrders.map((ord) => (
                <button
                  key={ord.id}
                  onClick={() => setLastPlacedOrderId(ord.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap cursor-pointer transition-colors border ${
                    latestOrder.id === ord.id
                      ? 'bg-[#0E382B] text-[#F3DF95] border-[#D4AF37]'
                      : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  Order #{ord.orderNumber} ({ord.status})
                </button>
              ))}
            </div>
          )}

          <div className="bg-[#FFFDF9] dark:bg-[#121614] rounded-2xl border border-[#D4AF37]/35 dark:border-stone-800 p-4 sm:p-8 space-y-6 shadow-xs">
            {/* Header info */}
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B6E15] dark:text-[#E6C665]">
                {t('customer.orderDispatchTracker')}
              </span>
              <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100 flex items-center justify-center gap-2">
                <span>Order {latestOrder.orderNumber}</span>
                {latestOrder.status === 'cancelled' && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-mono font-bold tracking-wide">
                    CANCELLED
                  </span>
                )}
              </h2>
              <div className="text-xs text-stone-500 font-medium">
                {latestOrder.tableNumber} · {latestOrder.customerName || 'Dining Guest'}
              </div>
            </div>

            {/* Cancel Toast Notification */}
            {cancelToastMessage && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{cancelToastMessage}</span>
                </div>
                <button
                  onClick={() => setCancelToastMessage(null)}
                  className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Cancelled Banner if order status is cancelled */}
            {latestOrder.status === 'cancelled' ? (
              <div className="p-5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-900/60 space-y-2 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                  <XCircle className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-rose-900 dark:text-rose-100">
                  Order Cancelled — Emergency Hotel Exit
                </h3>
                <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto leading-relaxed">
                  Your order has been terminated. Kitchen and Bar production lines were immediately notified and halted. No settlement charges apply for unserved items. Safe travels!
                </p>
              </div>
            ) : (
              /* Step Progress Bar */
              <div className="space-y-4 py-4">
                {[
                  { title: t('customer.step1Title'), desc: t('customer.step1Desc'), active: true, done: true },
                  { title: t('customer.step2Title'), desc: t('customer.step2Desc'), active: latestOrder.status !== 'received', done: latestOrder.status === 'ready' || latestOrder.status === 'delivered' },
                  { title: t('customer.step3Title'), desc: t('customer.step3Desc'), active: latestOrder.status === 'ready' || latestOrder.status === 'delivered', done: latestOrder.status === 'delivered' },
                  { title: t('customer.step4Title'), desc: t('customer.step4Desc'), active: latestOrder.status === 'delivered', done: latestOrder.status === 'delivered' },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        step.done
                          ? 'bg-[#0E382B] text-[#F3DF95] border border-[#D4AF37]'
                          : step.active
                          ? 'bg-[#D4AF37] text-stone-950 font-extrabold animate-pulse'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-400'
                      }`}
                    >
                      {step.done ? '✓' : idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">{step.title}</h4>
                      <p className="text-[11px] text-stone-500">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Items summary */}
            <div className="p-4 rounded-xl bg-[#FAF6EB] dark:bg-stone-900/40 border border-[#D4AF37]/30 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-stone-900 dark:text-stone-100">
                <span>Items Ordered:</span>
                <span className="text-[#8B6E15] dark:text-[#E6C665] font-mono">{latestOrder.totalAmount.toLocaleString()} {t('common.rwf')}</span>
              </div>
              <div className="divide-y divide-[#D4AF37]/20 dark:divide-stone-800/40">
                {latestOrder.items.map((it, i) => (
                  <div key={i} className="py-1 flex items-center justify-between text-stone-600 dark:text-stone-300">
                    <span>{it.quantity}x {translateDescription(it.name)}</span>
                    <span className="capitalize text-[10px] text-stone-400 font-mono">({it.department})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions: Order More OR Cancel Order */}
            {latestOrder.status !== 'cancelled' && latestOrder.status !== 'delivered' ? (
              <div className="pt-3 border-t border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => setActiveTab('menu')}
                  className="text-xs text-[#8B6E15] dark:text-[#E6C665] font-semibold hover:underline cursor-pointer"
                >
                  {t('customer.orderMore')}
                </button>

                {/* Emergency Cancel Order Button */}
                <button
                  onClick={() => {
                    setSelectedCancelReason('Urgent emergency - leaving hotel immediately');
                    setCustomCancelNotes('');
                    setIsCancelModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>Cancel Order (Emergency Departure)</span>
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-[#D4AF37]/20 text-center">
                <button
                  onClick={() => setActiveTab('menu')}
                  className="px-5 py-2.5 rounded-xl bg-[#0E382B] hover:bg-[#144737] text-[#FAF6EB] font-bold text-xs border border-[#D4AF37] shadow-sm cursor-pointer transition-colors"
                >
                  Browse Menu Catalog
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Detail & Inspection Modal */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#FFFDF9] dark:bg-[#121915] rounded-3xl border border-[#D4AF37]/50 max-w-lg w-full max-h-[92dvh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Product Image Header */}
            <div className="relative aspect-16/10 bg-stone-900">
              {selectedItemForModal.imageUrl ? (
                <img
                  src={selectedItemForModal.imageUrl}
                  alt={selectedItemForModal.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900 text-stone-400">
                  <UtensilsCrossed className="w-8 h-8 text-[#D4AF37] mb-2" />
                  <span>Culinary Preview</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <button
                onClick={() => setSelectedItemForModal(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute top-3 left-3">
                <span className="bg-black/60 backdrop-blur-md text-[#FAF6EB] font-medium px-2.5 py-1 rounded-md text-xs border border-white/10 flex items-center gap-1.5">
                  {selectedItemForModal.department === 'kitchen' ? (
                    <ChefHat className="w-3.5 h-3.5 text-[#D4AF37]" />
                  ) : (
                    <Wine className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  <span className="capitalize">{selectedItemForModal.department}</span>
                </span>
              </div>

              <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-end justify-between gap-2 text-white">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
                    {selectedItemForModal.category.toUpperCase()} · FRESH PREPARATION
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-sm">
                    {translateDescription(selectedItemForModal.name)}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="font-mono font-black text-lg sm:text-xl text-[#F3DF95] tabular-nums">
                    {(selectedItemForModal.price * modalQty).toLocaleString()} {t('common.rwf')}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                  Product Description & Notes
                </span>
                <p className="text-stone-700 dark:text-stone-300 text-xs sm:text-sm leading-relaxed">
                  {translateDescription(selectedItemForModal.description)}
                </p>
              </div>

              {selectedItemForModal.dietary && selectedItemForModal.dietary.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedItemForModal.dietary.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-[#D4AF37]/15 text-[#8B6E15] dark:text-[#E6C665] text-[11px] font-medium border border-[#D4AF37]/30"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[11px]">
                    ⏱ {selectedItemForModal.prepTimeMinutes} mins prep
                  </span>
                </div>
              )}

              {/* Special Instructions for Kitchen/Bar */}
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Special Kitchen Note (Optional)
                </label>
                <input
                  type="text"
                  value={specialInstruction}
                  onChange={(e) => setSpecialInstruction(e.target.value)}
                  placeholder="e.g. Extra spicy, dressing on side, no ice..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                />
              </div>

              {/* Quantity Stepper & Add to Order CTA */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center justify-center gap-2 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700 self-center sm:self-auto">
                  <button
                    onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-stone-700 dark:text-stone-200 hover:bg-white dark:hover:bg-stone-700 transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-sm text-stone-900 dark:text-stone-100">
                    {modalQty}
                  </span>
                  <button
                    onClick={() => setModalQty((q) => q + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-stone-700 dark:text-stone-200 hover:bg-white dark:hover:bg-stone-700 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {selectedItemForModal.isAvailable ? (
                  <button
                    onClick={() => {
                      handleAddToCart(selectedItemForModal, modalQty, specialInstruction);
                      setSelectedItemForModal(null);
                      setSpecialInstruction('');
                    }}
                    className="flex-1 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0E382B] hover:bg-[#144737] text-[#FAF6EB] border border-[#D4AF37]/80 font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-[#F3DF95]">
                      Add {modalQty} to Order · {(selectedItemForModal.price * modalQty).toLocaleString()} RWF
                    </span>
                  </button>
                ) : (
                  <div className="flex-1 min-h-[44px] px-5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700 font-bold text-xs flex items-center justify-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span>Temporarily Sold Out · Restocking</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Cancellation Confirmation Modal */}
      {isCancelModalOpen && latestOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#FFFDF9] dark:bg-[#121915] rounded-3xl border border-rose-500/40 max-w-md w-full max-h-[92dvh] overflow-y-auto p-4 sm:p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Cancel Order #{latestOrder.orderNumber}?
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Emergency Hotel Departure
                </p>
              </div>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Explanation Note */}
            <div className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl space-y-1">
              <p className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Leaving the hotel premises urgently?</span>
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                Confirming cancellation will instantly transmit an alert to the Kitchen Chef, Bartender, and Service Desk to halt dish preparation and void the bill.
              </p>
            </div>

            {/* Emergency Departure Reason Choices */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Select Emergency Reason:
              </label>
              {[
                'Emergency hotel checkout — leaving immediately',
                'Flight or airport transfer arrived early',
                'Personal or family emergency',
                'Work or urgent business call away',
                'Change of dining plans / departure',
              ].map((reason) => (
                <label
                  key={reason}
                  onClick={() => setSelectedCancelReason(reason)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedCancelReason === reason
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-800 text-rose-950 dark:text-rose-200 font-semibold'
                      : 'bg-stone-50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    checked={selectedCancelReason === reason}
                    onChange={() => setSelectedCancelReason(reason)}
                    className="accent-rose-600 cursor-pointer"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {/* Custom note */}
            <div>
              <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                Additional Note for Staff (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Taxi waiting outside, need to catch morning flight..."
                value={customCancelNotes}
                onChange={(e) => setCustomCancelNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-rose-400"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 font-bold text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Confirm & Void Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
