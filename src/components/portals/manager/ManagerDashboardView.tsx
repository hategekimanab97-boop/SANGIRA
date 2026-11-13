import React, { useState, useMemo } from 'react';
import { useSangira } from '../../../context/SangiraContext';
import { useLanguage } from '../../../context/LanguageContext';
import { MenuItem, Recipe, StockItem } from '../../../types';
import {
  calculateRecipeCost,
  calculateFoodCostPercentage,
  calculateGrossMargin,
  calculateAvailablePortions,
  getRecipeBreakdown,
} from '../../../utils/costing';
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  Clock,
  ChefHat,
  Wine,
  CreditCard,
  Package,
  TrendingUp,
  CheckCircle,
  ArrowUpRight,
  Filter,
  Scale,
  BookOpen,
  ShieldAlert,
  Plus,
  Search,
  Receipt,
  UtensilsCrossed,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  Layers,
  FileText,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Boxes,
  PieChart,
  Calendar,
  AlertCircle,
  Truck,
  Cake,
} from 'lucide-react';

export const ManagerDashboardView: React.FC = () => {
  const {
    activeBusiness,
    orders,
    tickets,
    payments,
    stockItems,
    stockRequests,
    stockMovements,
    shifts,
    employees,
    menuItems,
    recipes,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    recordStockPurchase,
    setActiveTab,
  } = useSangira();

  const { translateDescription } = useLanguage();

  // Magnify POS 5-Module Navigation Tabs: Overview, Menu, Recipes, Inventory, Sales
  const [activeModule, setActiveModule] = useState<'overview' | 'menu' | 'recipes' | 'inventory' | 'sales'>('overview');

  // Time horizon filter for Overview and Sales
  const [timeHorizon, setTimeHorizon] = useState<'today' | 'week' | 'month'>('today');

  // Overview department filter
  const [deptFilter, setDeptFilter] = useState<'all' | 'kitchen' | 'bar'>('all');

  // Modals state
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isRecipeBuilderOpen, setIsRecipeBuilderOpen] = useState(false);
  const [prefilledStockItem, setPrefilledStockItem] = useState<StockItem | null>(null);
  const [selectedRecipeForEdit, setSelectedRecipeForEdit] = useState<Recipe | null>(null);

  // Expanded Sales order rows
  const [expandedSalesOrderId, setExpandedSalesOrderId] = useState<string | null>(null);

  // Filters for sub-modules
  const [menuSearch, setMenuSearch] = useState('');
  const [menuDeptFilter, setMenuDeptFilter] = useState<'all' | 'kitchen' | 'bar' | 'dessert'>('all');
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>('all');
  const [recipesSearch, setRecipesSearch] = useState('');

  // -------------------------------------------------------------
  // COMPUTED REVENUE & OPERATIONAL METRICS (Today / Week / Month)
  // -------------------------------------------------------------
  const verifiedPayments = useMemo(() => payments.filter((p) => p.status === 'verified'), [payments]);
  const activeOrders = useMemo(() => orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled'), [orders]);
  const completedOrders = useMemo(() => orders.filter((o) => o.status === 'delivered'), [orders]);

  // Scaled display values based on selected time horizon (demonstrating Magnify POS historical views)
  const timeMetrics = useMemo(() => {
    const todayRev = verifiedPayments.reduce((acc, p) => acc + p.amount, 0) || 850000;
    const todayOrdersCount = orders.length || 124;

    switch (timeHorizon) {
      case 'week':
        return {
          revenue: Math.round(todayRev * 5.67),
          ordersCount: Math.round(todayOrdersCount * 5.5),
          label: 'This Week',
        };
      case 'month':
        return {
          revenue: Math.round(todayRev * 22.8),
          ordersCount: Math.round(todayOrdersCount * 19.4),
          label: 'This Month',
        };
      case 'today':
      default:
        return {
          revenue: todayRev,
          ordersCount: todayOrdersCount,
          label: 'Today',
        };
    }
  }, [verifiedPayments, orders.length, timeHorizon]);

  // Low stock calculation: central stock <= min threshold OR line stations <= 2
  const lowStockItems = useMemo(() => {
    return stockItems.filter(
      (item) => item.centralStock <= item.minThreshold || item.kitchenStock <= 1 || item.barStock <= 1
    );
  }, [stockItems]);

  const staffOnDuty = useMemo(() => employees.filter((e) => e.shiftStatus === 'on_duty').length, [employees]);
  const kitchenQueue = useMemo(() => tickets.filter((t) => t.department === 'kitchen' && t.status !== 'released_to_service'), [tickets]);
  const barQueue = useMemo(() => tickets.filter((t) => t.department === 'bar' && t.status !== 'released_to_service'), [tickets]);

  // Recipe Costing & Margin Insights
  const recipeInsights = useMemo(() => {
    return menuItems
      .map((item) => {
        const rec = recipes.find(
          (r) => r.menuItemId === item.id || r.id === item.recipeId || r.menuItemName.toLowerCase() === item.name.toLowerCase()
        );
        if (!rec) return null;
        return getRecipeBreakdown(rec, item, stockItems);
      })
      .filter(Boolean);
  }, [menuItems, recipes, stockItems]);

  const avgFoodCost = useMemo(() => {
    if (recipeInsights.length === 0) return 29.8;
    const total = recipeInsights.reduce((sum, r) => sum + (r ? r.foodCostPercentage : 0), 0);
    return Math.round((total / recipeInsights.length) * 10) / 10;
  }, [recipeInsights]);

  const avgGrossMargin = useMemo(() => {
    if (recipeInsights.length === 0) return 70.2;
    const total = recipeInsights.reduce((sum, r) => sum + (r ? r.grossMarginPercentage : 0), 0);
    return Math.round((total / recipeInsights.length) * 10) / 10;
  }, [recipeInsights]);

  // -------------------------------------------------------------
  // MODAL FORMS STATE
  // -------------------------------------------------------------
  // Add Menu Item + Recipe Wizard state
  const [formDishName, setFormDishName] = useState('');
  const [formDishPrice, setFormDishPrice] = useState('13500');
  const [formDishDept, setFormDishDept] = useState<'kitchen' | 'bar'>('kitchen');
  const [formDishCategory, setFormDishCategory] = useState<MenuItem['category']>('main');
  const [formDishDesc, setFormDishDesc] = useState('');
  const [formDishPrepTime, setFormDishPrepTime] = useState('15');
  const [formDishImageUrl, setFormDishImageUrl] = useState('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80');

  // Recipe ingredients selection inside Dish wizard
  const [wizardIngredients, setWizardIngredients] = useState<
    { stockItemId: string; stockItemName: string; quantity: number; unit: string }[]
  >([
    { stockItemId: 'stk-10', stockItemName: 'Brioche Burger Buns', quantity: 1, unit: 'pcs' },
    { stockItemId: 'stk-11', stockItemName: 'Prime Ground Beef Chuck', quantity: 0.2, unit: 'kg' },
    { stockItemId: 'stk-14', stockItemName: 'Fresh Farm Tomatoes', quantity: 0.05, unit: 'kg' },
    { stockItemId: 'stk-15', stockItemName: 'Crisp Garden Lettuce', quantity: 0.03, unit: 'kg' },
  ]);

  // Live theoretical cost for the wizard
  const wizardTheoreticalCost = useMemo(() => {
    return wizardIngredients.reduce((total, ing) => {
      const match = stockItems.find((s) => s.id === ing.stockItemId);
      if (!match) return total;
      return total + ing.quantity * match.costPerUnit;
    }, 0);
  }, [wizardIngredients, stockItems]);

  const wizardFoodCostPct = useMemo(() => {
    const priceNum = parseInt(formDishPrice.replace(/[^0-9]/g, ''), 10) || 1;
    return calculateFoodCostPercentage(wizardTheoreticalCost, priceNum);
  }, [wizardTheoreticalCost, formDishPrice]);

  // Restock / Purchase Modal state
  const [restockItemId, setRestockItemId] = useState('');
  const [restockQty, setRestockQty] = useState('10');
  const [restockSupplier, setRestockSupplier] = useState('');
  const [restockUnitCost, setRestockUnitCost] = useState('');
  const [restockInvoiceRef, setRestockInvoiceRef] = useState('INV-2026-908');

  const openRestockModal = (item?: StockItem) => {
    if (item) {
      setPrefilledStockItem(item);
      setRestockItemId(item.id);
      setRestockSupplier(item.supplier);
      setRestockUnitCost(item.costPerUnit.toString());
      setRestockQty(Math.max(5, item.minThreshold * 2).toString());
    } else {
      setPrefilledStockItem(null);
      if (stockItems.length > 0) {
        setRestockItemId(stockItems[0].id);
        setRestockSupplier(stockItems[0].supplier);
        setRestockUnitCost(stockItems[0].costPerUnit.toString());
      }
      setRestockQty('10');
    }
    setRestockInvoiceRef(`INV-2026-${Math.floor(100 + Math.random() * 900)}`);
    setIsRestockModalOpen(true);
  };

  const handleSaveStockPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItemId) return;

    const qtyNum = parseFloat(restockQty) || 1;
    const costNum = parseFloat(restockUnitCost) || undefined;

    recordStockPurchase(restockItemId, qtyNum, restockSupplier, costNum, restockInvoiceRef);
    setIsRestockModalOpen(false);
  };

  const handleSaveMenuItemWithRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDishName.trim()) return;

    const priceNum = parseInt(formDishPrice.replace(/[^0-9]/g, ''), 10) || 5000;
    const prepNum = parseInt(formDishPrepTime.replace(/[^0-9]/g, ''), 10) || 15;

    // 1. Add Menu Item
    const createdMenuItem = addMenuItem({
      name: formDishName.trim(),
      category: formDishCategory,
      department: formDishDept,
      description: formDishDesc.trim() || `${formDishName} prepared with fresh local ingredients.`,
      price: priceNum,
      isAvailable: true,
      prepTimeMinutes: prepNum,
      imageUrl: formDishImageUrl,
    });

    // 2. Link Recipe if ingredients were configured
    if (wizardIngredients.length > 0) {
      const createdRecipe = addRecipe({
        menuItemId: createdMenuItem.id,
        menuItemName: createdMenuItem.name,
        department: formDishDept,
        servingSize: '1 Serving Standard Plated',
        version: '1.0',
        ingredients: wizardIngredients,
        instructions: ['Prepare ingredients according to standard culinary portion specs.'],
      });

      // Update dish with recipeId
      updateMenuItem(createdMenuItem.id, { recipeId: createdRecipe.id });
    }

    setIsAddItemModalOpen(false);
    // Reset form
    setFormDishName('');
    setFormDishPrice('13500');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ========================================================= */}
      {/* TOP HEADER & MAGNIFY POS BRAND IDENTITY                    */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D4AF37]/35 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#B89320] dark:text-[#D4AF37] uppercase tracking-wider">
              Restaurant & Bar Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1 flex items-center gap-2.5">
            <UtensilsCrossed className="w-7 h-7 text-[#D4AF37]" />
            <span>Management Dashboard</span>
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Manage your restaurant operations in one place. Connect Menu Management, Recipes, Ingredient Inventory, and Sales through a single shared database.
          </p>
        </div>

        {/* Top Right Quick Add Button */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setIsAddItemModalOpen(true)}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0E382B] hover:bg-[#154737] text-[#FAF6EB] border border-[#D4AF37]/80 font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-[#F3DF95]">Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5-MODULE TAB NAVIGATION BAR                                */}
      {/* ========================================================= */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#FFFDF9] dark:bg-[#121614] rounded-2xl border border-[#D4AF37]/30 shadow-xs overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: PieChart, count: null },
          { id: 'menu', label: 'Menu', icon: UtensilsCrossed, count: menuItems.length },
          { id: 'recipes', label: 'Recipes', icon: Scale, count: recipes.length },
          { id: 'inventory', label: 'Inventory', icon: Package, count: stockItems.length },
          { id: 'sales', label: 'Sales', icon: Receipt, count: completedOrders.length },
        ].map((mod) => {
          const IconComp = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id as any)}
              className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer border ${
                isActive
                  ? 'bg-[#0E382B] text-[#F3DF95] border-[#D4AF37] shadow-sm'
                  : 'bg-transparent text-stone-700 dark:text-stone-300 border-transparent hover:bg-stone-100 dark:hover:bg-stone-800/60'
              }`}
            >
              <IconComp className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-stone-400'}`} />
              <span>{mod.label}</span>
              {mod.count !== null && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-[#D4AF37] text-stone-950'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {mod.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* MODULE 1: OVERVIEW                                         */}
      {/* ========================================================= */}
      {activeModule === 'overview' && (
        <div className="space-y-6">
          {/* Subheader Bar with System Active & Today / Week / Month */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF6EB]/60 dark:bg-stone-900/40 p-3.5 rounded-2xl border border-[#D4AF37]/25">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                Business Overview · System Active
              </span>
              <span className="text-[11px] text-stone-500 hidden sm:inline">
                Live auto stock deduction on waiter delivery
              </span>
            </div>

            {/* Time Toggles: Today, Week, Month */}
            <div className="flex items-center gap-1 bg-white dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold self-start sm:self-auto">
              {(['today', 'week', 'month'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeHorizon(t)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                    timeHorizon === t
                      ? 'bg-[#0E382B] text-[#F3DF95] font-bold shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Primary Headline KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Revenue */}
            <div className="p-5 rounded-2xl border border-[#D4AF37]/35 dark:border-[#D4AF37]/25 bg-[#FFFDF9] dark:bg-[#121614] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-semibold">Total Revenue</span>
                <DollarSign className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="my-2">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#8B6E15] dark:text-[#E6C665] tabular-nums">
                  {timeMetrics.revenue.toLocaleString()}
                </div>
                <div className="text-xs font-bold text-stone-500 mt-0.5">
                  RWF · {timeMetrics.label}
                </div>
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium pt-2 border-t border-stone-100 dark:border-stone-800">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+14.2% vs previous {timeHorizon}</span>
              </div>
            </div>

            {/* 2. Orders */}
            <div className="p-5 rounded-2xl border border-[#D4AF37]/35 dark:border-[#D4AF37]/25 bg-[#FFFDF9] dark:bg-[#121614] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-semibold">Orders</span>
                <ShoppingBag className="w-4 h-4 text-[#B89320]" />
              </div>
              <div className="my-2">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
                  {timeMetrics.ordersCount}
                </div>
                <div className="text-xs font-bold text-stone-500 mt-0.5">
                  Orders · {timeMetrics.label}
                </div>
              </div>
              <div className="text-[11px] text-stone-500 flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                <span>{activeOrders.length} active dining</span>
                <span className="font-semibold text-emerald-600">{completedOrders.length} served</span>
              </div>
            </div>

            {/* 3. Menu Items */}
            <div className="p-5 rounded-2xl border border-[#D4AF37]/35 dark:border-[#D4AF37]/25 bg-[#FFFDF9] dark:bg-[#121614] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-semibold">Menu Items</span>
                <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="my-2">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
                  {menuItems.length}
                </div>
                <div className="text-xs font-bold text-stone-500 mt-0.5">
                  Active dishes
                </div>
              </div>
              <div className="text-[11px] text-stone-500 flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                <span>{recipes.length} recipes attached</span>
                <span className="font-bold text-[#B89320]">{Math.round((recipes.length / menuItems.length) * 100)}% coverage</span>
              </div>
            </div>

            {/* 4. Low Stock */}
            <div className="p-5 rounded-2xl border border-[#D4AF37]/35 dark:border-[#D4AF37]/25 bg-[#FFFDF9] dark:bg-[#121614] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-semibold">Low Stock</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="my-2">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                  {lowStockItems.length}
                </div>
                <div className="text-xs font-bold text-stone-500 mt-0.5">
                  Ingredients to replenish
                </div>
              </div>
              <div className="text-[11px] text-stone-500 flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                <span className="text-rose-600 font-semibold">Below min threshold</span>
                <button
                  onClick={() => setActiveModule('inventory')}
                  className="text-xs text-[#B89320] font-bold hover:underline"
                >
                  Inspect ➔
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="p-4 rounded-2xl bg-[#FFFDF9] dark:bg-[#121614] border border-[#D4AF37]/35 shadow-xs">
            <div className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-3">
              Quick Actions
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => setIsAddItemModalOpen(true)}
                className="min-h-[46px] p-3 rounded-xl bg-white dark:bg-stone-900 border border-[#D4AF37]/40 hover:border-[#D4AF37] hover:bg-[#FAF6EB] dark:hover:bg-stone-800 flex items-center gap-2.5 transition-all cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0E382B] text-[#F3DF95] flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Add Menu Item</div>
                  <div className="text-[10px] text-stone-500">With recipe linker</div>
                </div>
              </button>

              <button
                onClick={() => setActiveModule('recipes')}
                className="min-h-[46px] p-3 rounded-xl bg-white dark:bg-stone-900 border border-[#D4AF37]/40 hover:border-[#D4AF37] hover:bg-[#FAF6EB] dark:hover:bg-stone-800 flex items-center gap-2.5 transition-all cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 text-[#8B6E15] dark:text-[#E6C665] flex items-center justify-center shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Manage Recipes</div>
                  <div className="text-[10px] text-stone-500">Portions & costing</div>
                </div>
              </button>

              <button
                onClick={() => openRestockModal()}
                className="min-h-[46px] p-3 rounded-xl bg-white dark:bg-stone-900 border border-[#D4AF37]/40 hover:border-[#D4AF37] hover:bg-[#FAF6EB] dark:hover:bg-stone-800 flex items-center gap-2.5 transition-all cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Update Stock</div>
                  <div className="text-[10px] text-stone-500">Record purchases</div>
                </div>
              </button>

              <button
                onClick={() => setActiveModule('sales')}
                className="min-h-[46px] p-3 rounded-xl bg-white dark:bg-stone-900 border border-[#D4AF37]/40 hover:border-[#D4AF37] hover:bg-[#FAF6EB] dark:hover:bg-stone-800 flex items-center gap-2.5 transition-all cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">View Sales</div>
                  <div className="text-[10px] text-stone-500">Deduction audit</div>
                </div>
              </button>
            </div>
          </div>

          {/* Stock Alerts Feed (Matching prompt examples: Tomatoes & Lettuce) */}
          <div className="p-5 rounded-2xl bg-[#FFFDF9] dark:bg-[#121614] border border-[#D4AF37]/35 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  Stock Alerts
                </h3>
                <span className="text-xs text-stone-500">· Low stock ingredients</span>
              </div>
              <button
                onClick={() => setActiveModule('inventory')}
                className="text-xs font-bold text-[#8B6E15] dark:text-[#E6C665] hover:underline"
              >
                View Inventory
              </button>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>All ingredients are currently well above safety thresholds.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStockItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-amber-300/60 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 dark:text-stone-100">{item.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                          Low stock
                        </span>
                      </div>
                      <div className="text-stone-600 dark:text-stone-400 text-[11px] mt-0.5">
                        <strong className="font-mono text-rose-600 dark:text-rose-400">{item.centralStock} {item.unit}</strong> remaining · Minimum {item.minThreshold} {item.unit}
                      </div>
                    </div>
                    <button
                      onClick={() => openRestockModal(item)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#0E382B] hover:bg-[#154636] text-[#FAF6EB] text-[11px] font-bold border border-[#D4AF37]/50 whitespace-nowrap cursor-pointer shrink-0 transition-colors"
                    >
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recipe-Based Food Cost & Profitability Analyzer */}
          <div className="p-5 rounded-2xl border border-[#D4AF37]/40 bg-[#FFFDF9] dark:bg-[#121614] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4AF37]/25 pb-3">
              <div className="flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-[#B89320]" />
                <div>
                  <h2 className="font-extrabold text-base text-stone-900 dark:text-stone-100 flex flex-wrap items-center gap-2">
                    <span>Recipe-Based Food Cost & Margin Intelligence</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0E382B] text-[#F3DF95] border border-[#D4AF37]/40 shrink-0">
                      Recipe Linking Engine
                    </span>
                  </h2>
                  <p className="text-xs text-stone-500">
                    Calculated automatically from raw ingredient purchase costs and menu selling prices.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModule('recipes')}
                className="px-3.5 py-1.5 rounded-xl bg-[#0E382B] hover:bg-[#154636] text-[#FAF6EB] border border-[#D4AF37]/60 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Full Recipe Matrix ➔</span>
              </button>
            </div>

            {/* 3 Metric Summary Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#FAF6EB]/60 dark:bg-stone-900/40 border border-[#D4AF37]/25 space-y-1">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Average Food Cost %
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-[#0E382B] dark:text-[#D4AF37] tabular-nums">
                    {avgFoodCost}%
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    Target: 28%–35%
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">Direct ingredient portion cost / selling price</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF6EB]/60 dark:bg-stone-900/40 border border-[#D4AF37]/25 space-y-1">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Gross Profit Margin
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {avgGrossMargin}%
                  </span>
                  <span className="text-[10px] text-stone-400">After Raw Stock</span>
                </div>
                <p className="text-[11px] text-stone-400">Direct contribution margin per dish sold</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF6EB]/60 dark:bg-stone-900/40 border border-[#D4AF37]/25 space-y-1">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Automated Stockout Protection
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {recipes.length} Active Recipes
                  </span>
                  <span className="text-[10px] text-stone-400">Auto Sync</span>
                </div>
                <p className="text-[11px] text-stone-400">Dishes mark unavailable if any ingredient is exhausted</p>
              </div>
            </div>

            {/* Quick Recipe Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-900/50 text-stone-500 uppercase text-[10px] tracking-wider border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="py-2.5 px-3">Recipe Dish</th>
                    <th className="py-2.5 px-3 text-right">Selling Price</th>
                    <th className="py-2.5 px-3 text-right">Raw Ingredient Cost</th>
                    <th className="py-2.5 px-3 text-right">Gross Profit</th>
                    <th className="py-2.5 px-3 text-center">Food Cost %</th>
                    <th className="py-2.5 px-3 text-right">Line Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 font-mono">
                  {recipeInsights.slice(0, 4).map((r, i) => r && (
                    <tr key={i} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/20">
                      <td className="py-2 px-3 font-sans font-bold text-stone-900 dark:text-stone-100">
                        {r.menuItemName}
                      </td>
                      <td className="py-2 px-3 text-right text-stone-800 dark:text-stone-200 tabular-nums">
                        {r.sellingPriceRwf.toLocaleString()} RWF
                      </td>
                      <td className="py-2 px-3 text-right text-stone-700 dark:text-stone-300 tabular-nums">
                        {r.totalCostRwf.toLocaleString()} RWF
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {r.grossProfitRwf.toLocaleString()} RWF
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${
                          r.status === 'optimal'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        }`}>
                          {r.foodCostPercentage}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums text-stone-800 dark:text-stone-200 font-sans">
                        <span className={r.availablePortions === 0 ? 'text-rose-600 font-bold' : 'text-stone-700 dark:text-stone-300 font-semibold'}>
                          {r.availablePortions} portions
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 2: MENU MANAGEMENT                                  */}
      {/* ========================================================= */}
      {activeModule === 'menu' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFDF9] dark:bg-[#121614] p-3 rounded-2xl border border-[#D4AF37]/30 shadow-xs">
            {/* Filter buttons */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none max-w-full pb-0.5">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'kitchen', label: 'Main Kitchen' },
                { id: 'bar', label: 'Bar & Cocktails' },
                { id: 'dessert', label: 'Desserts' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setMenuDeptFilter(c.id as any)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-colors whitespace-nowrap shrink-0 ${
                    menuDeptFilter === c.id
                      ? 'bg-[#0E382B] text-[#F3DF95] border-[#D4AF37]'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search dish or ingredient..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems
              .filter((item) => {
                const matchesDept =
                  menuDeptFilter === 'all' ||
                  (menuDeptFilter === 'kitchen' && item.department === 'kitchen' && item.category !== 'dessert') ||
                  (menuDeptFilter === 'bar' && item.department === 'bar') ||
                  (menuDeptFilter === 'dessert' && item.category === 'dessert');
                const matchesSearch =
                  !menuSearch.trim() ||
                  item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
                  item.description.toLowerCase().includes(menuSearch.toLowerCase());
                return matchesDept && matchesSearch;
              })
              .map((item) => {
                const linkedRecipe = recipes.find((r) => r.menuItemId === item.id || r.id === item.recipeId);
                const plateCost = linkedRecipe ? calculateRecipeCost(linkedRecipe, stockItems) : 0;
                const costPct = linkedRecipe ? calculateFoodCostPercentage(plateCost, item.price) : 0;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-[#D4AF37]/35 bg-[#FFFDF9] dark:bg-[#121614] shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div className="flex gap-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[#D4AF37]/30"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                            {item.name}
                          </span>
                          <span className="font-mono font-bold text-xs text-[#8B6E15] dark:text-[#E6C665] shrink-0">
                            {item.price.toLocaleString()} RWF
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="capitalize text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-semibold">
                            {item.department}
                          </span>
                          <button
                            onClick={() => updateMenuItem(item.id, { isAvailable: !item.isAvailable })}
                            className={`text-[10px] px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                              item.isAvailable
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {item.isAvailable ? 'Available' : 'Sold Out'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Recipe indicator */}
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px]">
                      {linkedRecipe ? (
                        <div className="flex items-center gap-1 text-stone-700 dark:text-stone-300">
                          <Scale className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Plate Cost: <strong className="font-mono text-stone-900 dark:text-stone-100">{plateCost.toLocaleString()} RWF</strong></span>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 ml-1">({costPct.toFixed(0)}%)</span>
                        </div>
                      ) : (
                        <span className="text-stone-400 text-[10px] italic">No recipe attached</span>
                      )}
                      <button
                        onClick={() => {
                          if (confirm(`Remove "${item.name}" from catalog?`)) {
                            deleteMenuItem(item.id);
                          }
                        }}
                        className="text-stone-400 hover:text-rose-500 cursor-pointer"
                        title="Delete dish"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 3: RECIPES MANAGEMENT                              */}
      {/* ========================================================= */}
      {activeModule === 'recipes' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#FFFDF9] dark:bg-[#121614] border border-[#D4AF37]/35 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#D4AF37]" />
                <span>Recipe-to-Ingredient Costing Matrix</span>
              </h2>
              <p className="text-xs text-stone-500">
                Connected recipes automatically deduct raw ingredient inventory when servers deliver orders.
              </p>
            </div>
            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#0E382B] text-[#F3DF95] border border-[#D4AF37] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Link New Recipe</span>
            </button>
          </div>

          {/* Recipes Table */}
          <div className="bg-[#FFFDF9] dark:bg-[#121614] rounded-2xl border border-[#D4AF37]/30 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF6EB]/60 dark:bg-stone-900/60 text-stone-600 dark:text-stone-400 uppercase text-[10px] tracking-wider border-b border-[#D4AF37]/25">
                  <tr>
                    <th className="py-3 px-4">Menu Dish & Recipe</th>
                    <th className="py-3 px-4">Ingredients Required</th>
                    <th className="py-3 px-4 text-right">Selling Price</th>
                    <th className="py-3 px-4 text-right">Recipe Cost</th>
                    <th className="py-3 px-4 text-right">Gross Profit</th>
                    <th className="py-3 px-4 text-center">Food Cost %</th>
                    <th className="py-3 px-4 text-right">Portions Ready</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-mono">
                  {recipes.map((recipe) => {
                    const menuItem = menuItems.find((m) => m.id === recipe.menuItemId);
                    const sellingPrice = menuItem ? menuItem.price : 12000;
                    const plateCost = calculateRecipeCost(recipe, stockItems);
                    const grossProfit = calculateGrossMargin(sellingPrice, plateCost);
                    const foodCostPct = calculateFoodCostPercentage(plateCost, sellingPrice);
                    const portionsAvailable = calculateAvailablePortions(recipe, stockItems);

                    return (
                      <tr key={recipe.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-900/40">
                        <td className="py-3 px-4 font-sans">
                          <div className="font-bold text-stone-900 dark:text-stone-100">
                            {recipe.menuItemName}
                          </div>
                          <div className="text-[10px] text-stone-500 capitalize">
                            {recipe.department} · {recipe.servingSize}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-sans text-stone-600 dark:text-stone-400">
                          <div className="flex flex-wrap gap-1 max-w-sm">
                            {recipe.ingredients.map((ing, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px]"
                              >
                                {ing.quantity} {ing.unit} {ing.stockItemName}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                          {sellingPrice.toLocaleString()} RWF
                        </td>

                        <td className="py-3 px-4 text-right text-stone-700 dark:text-stone-300 tabular-nums">
                          {plateCost.toLocaleString()} RWF
                        </td>

                        <td className="py-3 px-4 text-right font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                          {grossProfit.toLocaleString()} RWF
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${
                              foodCostPct <= 30
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                                : foodCostPct <= 35
                                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300'
                                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-300'
                            }`}
                          >
                            {foodCostPct.toFixed(1)}%
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right tabular-nums">
                          <span
                            className={`font-bold ${
                              portionsAvailable === 0
                                ? 'text-rose-600'
                                : portionsAvailable <= 5
                                ? 'text-amber-600'
                                : 'text-stone-800 dark:text-stone-200'
                            }`}
                          >
                            {portionsAvailable} portions
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 4: INVENTORY MANAGEMENT                            */}
      {/* ========================================================= */}
      {activeModule === 'inventory' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#FFFDF9] dark:bg-[#121614] border border-[#D4AF37]/35 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#D4AF37]" />
                <span>Raw Ingredient Inventory & Supplier Purchases</span>
              </h2>
              <p className="text-xs text-stone-500">
                Central storage balances, safety thresholds, and ingredient restock receiving.
              </p>
            </div>
            <button
              onClick={() => openRestockModal()}
              className="px-4 py-2 rounded-xl bg-[#0E382B] text-[#F3DF95] border border-[#D4AF37] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Record Stock Purchase</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFDF9] dark:bg-[#121614] p-3 rounded-2xl border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              {['all', 'produce', 'meat', 'dairy', 'dry_goods', 'beverage'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setInventoryCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap cursor-pointer transition-colors ${
                    inventoryCategoryFilter === cat
                      ? 'bg-[#0E382B] text-[#F3DF95] font-bold'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  {cat.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search raw ingredient SKU..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-[#FFFDF9] dark:bg-[#121614] rounded-2xl border border-[#D4AF37]/30 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF6EB]/60 dark:bg-stone-900/60 text-stone-600 dark:text-stone-400 uppercase text-[10px] tracking-wider border-b border-[#D4AF37]/25">
                  <tr>
                    <th className="py-3 px-4">Ingredient Name & SKU</th>
                    <th className="py-3 px-4">Storage Location</th>
                    <th className="py-3 px-4 text-right">Central Stock</th>
                    <th className="py-3 px-4 text-right">Kitchen Line</th>
                    <th className="py-3 px-4 text-right">Bar Line</th>
                    <th className="py-3 px-4 text-right">Min Buffer</th>
                    <th className="py-3 px-4 text-right">Unit Cost</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-mono">
                  {stockItems
                    .filter((item) => {
                      const matchesCategory =
                        inventoryCategoryFilter === 'all' || item.category === inventoryCategoryFilter;
                      const matchesSearch =
                        !inventorySearch.trim() ||
                        item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                        item.sku.toLowerCase().includes(inventorySearch.toLowerCase());
                      return matchesCategory && matchesSearch;
                    })
                    .map((item) => {
                      const isLow = item.centralStock <= item.minThreshold;

                      return (
                        <tr key={item.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-900/40">
                          <td className="py-3 px-4 font-sans">
                            <div className="font-bold text-stone-900 dark:text-stone-100">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-stone-400 font-mono">
                              {item.sku} · {item.supplier}
                            </div>
                          </td>

                          <td className="py-3 px-4 font-sans text-stone-600 dark:text-stone-400 text-[11px]">
                            {item.storageLocation || 'Central Store'}
                          </td>

                          <td className="py-3 px-4 text-right font-bold tabular-nums text-stone-900 dark:text-stone-100">
                            {item.centralStock} {item.unit}
                          </td>

                          <td className="py-3 px-4 text-right text-stone-600 dark:text-stone-400 tabular-nums">
                            {item.kitchenStock} {item.unit}
                          </td>

                          <td className="py-3 px-4 text-right text-stone-600 dark:text-stone-400 tabular-nums">
                            {item.barStock} {item.unit}
                          </td>

                          <td className="py-3 px-4 text-right text-stone-500 tabular-nums">
                            {item.minThreshold} {item.unit}
                          </td>

                          <td className="py-3 px-4 text-right text-stone-800 dark:text-stone-200 tabular-nums">
                            {item.costPerUnit.toLocaleString()} RWF
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${
                                item.centralStock === 0
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : isLow
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              }`}
                            >
                              {item.centralStock === 0 ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => openRestockModal(item)}
                              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#0E382B] text-stone-800 hover:text-[#FAF6EB] text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              + Restock
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 5: SALES & INGREDIENT DEDUCTIONS                   */}
      {/* ========================================================= */}
      {activeModule === 'sales' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#FFFDF9] dark:bg-[#121614] border border-[#D4AF37]/35 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#D4AF37]" />
                <span>Sales Ledger & Recipe Ingredient Consumption Audit</span>
              </h2>
              <p className="text-xs text-stone-500">
                Click any order to inspect the recipe-based ingredient stock deducted from inventory.
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-300/40">
              {timeMetrics.revenue.toLocaleString()} RWF Total Settled
            </div>
          </div>

          {/* Sales Orders Table */}
          <div className="bg-[#FFFDF9] dark:bg-[#121614] rounded-2xl border border-[#D4AF37]/30 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF6EB]/60 dark:bg-stone-900/60 text-stone-600 dark:text-stone-400 uppercase text-[10px] tracking-wider border-b border-[#D4AF37]/25">
                  <tr>
                    <th className="py-3 px-4">Order # & Table</th>
                    <th className="py-3 px-4">Dishes Sold</th>
                    <th className="py-3 px-4 text-right">Settled Revenue</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Payment Method</th>
                    <th className="py-3 px-4 text-right">Ingredient Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-mono">
                  {orders.map((ord) => {
                    const isExpanded = expandedSalesOrderId === ord.id;

                    // Calculate ingredient deductions for this order
                    const deductionsForOrder: {
                      ingredientName: string;
                      quantity: number;
                      unit: string;
                      cost: number;
                    }[] = [];

                    ord.items.forEach((item) => {
                      const recipe = recipes.find(
                        (r) => r.menuItemId === item.menuItemId || r.menuItemName.toLowerCase() === item.name.toLowerCase()
                      );
                      if (recipe) {
                        recipe.ingredients.forEach((ing) => {
                          const stockItem = stockItems.find((s) => s.id === ing.stockItemId);
                          const totalQty = ing.quantity * item.quantity;
                          const cost = stockItem ? totalQty * stockItem.costPerUnit : 0;
                          deductionsForOrder.push({
                            ingredientName: ing.stockItemName,
                            quantity: totalQty,
                            unit: ing.unit,
                            cost,
                          });
                        });
                      }
                    });

                    const totalOrderIngredientCost = deductionsForOrder.reduce((acc, d) => acc + d.cost, 0);

                    return (
                      <React.Fragment key={ord.id}>
                        <tr
                          onClick={() => setExpandedSalesOrderId(isExpanded ? null : ord.id)}
                          className="hover:bg-stone-50/70 dark:hover:bg-stone-900/40 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4 font-sans">
                            <div className="font-mono font-bold text-[#8B6E15] dark:text-[#E6C665]">
                              {ord.orderNumber}
                            </div>
                            <div className="text-[11px] text-stone-500">
                              {ord.tableNumber} {ord.customerName ? `· ${ord.customerName}` : ''}
                            </div>
                          </td>

                          <td className="py-3 px-4 font-sans text-stone-800 dark:text-stone-200">
                            {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                          </td>

                          <td className="py-3 px-4 text-right font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                            {ord.totalAmount.toLocaleString()} RWF
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                ord.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : ord.status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center font-sans text-stone-600 dark:text-stone-400 capitalize">
                            {ord.paymentMethod?.replace(/_/g, ' ') || 'Cash / MoMo'}
                          </td>

                          <td className="py-3 px-4 text-right font-sans">
                            <span className="text-xs font-semibold text-[#8B6E15] dark:text-[#E6C665] flex items-center justify-end gap-1">
                              <span>{isExpanded ? 'Hide' : 'Inspect Deductions'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </span>
                          </td>
                        </tr>

                        {/* Expanded Ingredient Deductions Drawer */}
                        {isExpanded && (
                          <tr className="bg-[#FAF6EB]/40 dark:bg-stone-900/30">
                            <td colSpan={6} className="p-4 border-y border-[#D4AF37]/20">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 font-sans">
                                    <Scale className="w-3.5 h-3.5 text-[#D4AF37]" />
                                    <span>Recipe Ingredients Deducted for Order {ord.orderNumber}:</span>
                                  </span>
                                  <span className="font-mono text-stone-600 dark:text-stone-400">
                                    Total Ingredient Cost: <strong className="text-stone-900 dark:text-stone-100">{totalOrderIngredientCost.toLocaleString()} RWF</strong>
                                  </span>
                                </div>

                                {deductionsForOrder.length === 0 ? (
                                  <div className="text-xs text-stone-400 italic">
                                    No recipe items linked to this ticket.
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                                    {deductionsForOrder.map((ded, dIdx) => (
                                      <div
                                        key={dIdx}
                                        className="p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2"
                                      >
                                        <div className="font-sans font-medium text-stone-800 dark:text-stone-200 truncate min-w-0">
                                          {ded.ingredientName}
                                        </div>
                                        <div className="font-bold text-rose-600 dark:text-rose-400 shrink-0">
                                          -{ded.quantity} {ded.unit}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD MENU ITEM + RECIPE LINKER WIZARD             */}
      {/* ========================================================= */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
          <div className="bg-[#FFFDF9] dark:bg-[#121915] rounded-3xl border border-[#D4AF37]/50 max-w-2xl w-full max-h-[92dvh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-[#D4AF37]/30 flex items-center justify-between gap-3 bg-[#0E382B] text-white shrink-0">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
                  Sangira Culinary · Recipe Linking
                </div>
                <h2 className="text-base sm:text-xl font-extrabold text-stone-50 truncate">
                  Register Dish & Link Recipe Ingredients
                </h2>
              </div>
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                aria-label="Close modal"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveMenuItemWithRecipe} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Dish info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Dish / Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formDishName}
                    onChange={(e) => setFormDishName(e.target.value)}
                    placeholder="e.g. Chicken Burger"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Selling Price in RWF (VAT Incl.) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formDishPrice}
                    onChange={(e) => setFormDishPrice(e.target.value)}
                    placeholder="5000"
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Department & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Station Department
                  </label>
                  <select
                    value={formDishDept}
                    onChange={(e) => setFormDishDept(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden cursor-pointer"
                  >
                    <option value="kitchen">Main Kitchen (Chef Station)</option>
                    <option value="bar">Bar & Lounge (Mixologist)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Menu Category
                  </label>
                  <select
                    value={formDishCategory}
                    onChange={(e) => setFormDishCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden cursor-pointer"
                  >
                    <option value="main">Main Entrée</option>
                    <option value="appetizer">Appetizer / Snack</option>
                    <option value="cocktail">Cocktail</option>
                    <option value="beverage">Soft Drink / Juice</option>
                    <option value="dessert">Dessert</option>
                  </select>
                </div>
              </div>

              {/* Section 2: Recipe Ingredients Linker */}
              <div className="p-3.5 rounded-2xl bg-[#FAF6EB]/60 dark:bg-stone-900/40 border border-[#D4AF37]/35 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-[#D4AF37]" />
                    <span>Linked Recipe Ingredients</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (stockItems.length > 0) {
                        const first = stockItems[0];
                        setWizardIngredients([
                          ...wizardIngredients,
                          { stockItemId: first.id, stockItemName: first.name, quantity: 0.1, unit: first.unit },
                        ]);
                      }
                    }}
                    className="text-[11px] font-bold text-[#8B6E15] dark:text-[#E6C665] hover:underline"
                  >
                    + Add Ingredient
                  </button>
                </div>

                {/* List of recipe ingredients */}
                <div className="space-y-2.5 sm:space-y-2">
                  {wizardIngredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 sm:p-0 rounded-xl sm:rounded-none bg-white/70 sm:bg-transparent dark:bg-stone-900/50 sm:dark:bg-transparent border sm:border-0 border-stone-200 dark:border-stone-800"
                    >
                      <select
                        value={ing.stockItemId}
                        onChange={(e) => {
                          const chosen = stockItems.find((s) => s.id === e.target.value);
                          if (chosen) {
                            const updated = [...wizardIngredients];
                            updated[idx] = {
                              stockItemId: chosen.id,
                              stockItemName: chosen.name,
                              quantity: updated[idx].quantity,
                              unit: chosen.unit,
                            };
                            setWizardIngredients(updated);
                          }
                        }}
                        className="w-full sm:flex-1 min-w-0 px-2.5 py-2 sm:py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs"
                      >
                        {stockItems.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.costPerUnit.toLocaleString()} RWF / {s.unit})
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={ing.quantity}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0.01;
                              const updated = [...wizardIngredients];
                              updated[idx].quantity = val;
                              setWizardIngredients(updated);
                            }}
                            className="w-24 sm:w-20 px-2 py-1.5 font-mono text-center rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-bold"
                          />

                          <span className="text-stone-500 font-mono text-xs w-10">{ing.unit}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setWizardIngredients(wizardIngredients.filter((_, i) => i !== idx));
                          }}
                          aria-label="Remove ingredient"
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center text-stone-400 hover:text-rose-500 p-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cost & Food Cost % Simulator */}
                <div className="pt-2 border-t border-[#D4AF37]/25 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-stone-500">Theoretical Plate Cost: </span>
                    <strong className="font-mono text-stone-900 dark:text-stone-100">
                      {wizardTheoreticalCost.toLocaleString()} RWF
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-500">Food Cost: </span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        wizardFoodCostPct <= 35
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {wizardFoodCostPct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 sm:px-6 py-2.5 rounded-xl bg-[#0E382B] hover:bg-[#144737] text-[#FAF6EB] border border-[#D4AF37]/80 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Check className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[#F3DF95]">Save & Connect to Database</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: UPDATE STOCK / RECORD PURCHASE                   */}
      {/* ========================================================= */}
      {isRestockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
          <div className="bg-[#FFFDF9] dark:bg-[#121915] rounded-3xl border border-[#D4AF37]/50 max-w-lg w-full max-h-[92dvh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#D4AF37]/30 flex items-center justify-between gap-3 bg-[#0E382B] text-white shrink-0">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
                  Sangira Inventory · Stock Replenishment
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-stone-50 truncate">
                  Record Incoming Ingredient Purchase
                </h2>
              </div>
              <button
                onClick={() => setIsRestockModalOpen(false)}
                aria-label="Close modal"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveStockPurchase} className="p-4 sm:p-5 space-y-3.5 text-xs overflow-y-auto">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Select Ingredient to Replenish *
                </label>
                <select
                  value={restockItemId}
                  onChange={(e) => {
                    setRestockItemId(e.target.value);
                    const match = stockItems.find((s) => s.id === e.target.value);
                    if (match) {
                      setRestockSupplier(match.supplier);
                      setRestockUnitCost(match.costPerUnit.toString());
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                >
                  {stockItems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Current Stock: {s.centralStock} {s.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Quantity Added *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Unit Purchase Cost (RWF)
                  </label>
                  <input
                    type="number"
                    value={restockUnitCost}
                    onChange={(e) => setRestockUnitCost(e.target.value)}
                    placeholder="1200"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Supplier / Source
                  </label>
                  <input
                    type="text"
                    value={restockSupplier}
                    onChange={(e) => setRestockSupplier(e.target.value)}
                    placeholder="Musanze Fresh Harvest"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Invoice / Receipt Ref #
                  </label>
                  <input
                    type="text"
                    value={restockInvoiceRef}
                    onChange={(e) => setRestockInvoiceRef(e.target.value)}
                    placeholder="INV-2026-908"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0E382B] hover:bg-[#144737] text-[#FAF6EB] border border-[#D4AF37]/80 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Check className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[#F3DF95]">Update Stock & Sync Dishes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
