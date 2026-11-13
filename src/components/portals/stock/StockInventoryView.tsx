import React, { useState, useMemo } from 'react';
import { useSangira } from '../../../context/SangiraContext';
import { StockItem, Recipe, MenuItem } from '../../../types';
import {
  calculateRecipeCost,
  calculateFoodCostPercentage,
  calculateGrossMargin,
  calculateAvailablePortions,
  getRecipeBreakdown,
} from '../../../utils/costing';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  History,
  XCircle,
  Send,
  X,
  ArrowRight,
  TrendingDown,
  BookOpen,
  UtensilsCrossed,
  ChefHat,
  Wine,
  DollarSign,
  Edit3,
  Trash2,
  ArrowUpRight,
  Scale,
  Info,
} from 'lucide-react';

export const StockInventoryView: React.FC = () => {
  const {
    stockItems,
    stockRequests,
    stockMovements,
    menuItems,
    recipes,
    approveStockRequest,
    issueStock,
    addStockItem,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    evaluateMenuItemAvailability,
    activeTab,
    setActiveTab,
  } = useSangira();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // New item form (Raw Material / Supply Line)
  const [newItem, setNewItem] = useState({
    sku: 'ING-SPEC-09',
    name: '',
    category: 'produce' as StockItem['category'],
    unit: 'kg',
    centralStock: 20,
    kitchenStock: 0,
    barStock: 0,
    minThreshold: 10,
    costPerUnit: 2500,
    supplier: 'Kigali Fresh Market',
    expiryDate: '2026-12-31',
    batchNumber: 'BAT-2026-991',
    storageLocation: 'Cold Room Shelf B',
  });

  // Recipe Builder Form State
  const [recipeForm, setRecipeForm] = useState<{
    id?: string;
    menuItemId: string;
    menuItemName: string;
    department: 'kitchen' | 'bar';
    servingSize: string;
    version: string;
    ingredients: {
      stockItemId: string;
      stockItemName: string;
      quantity: number;
      unit: string;
    }[];
    instructions: string[];
  }>({
    menuItemId: menuItems[0]?.id || '',
    menuItemName: menuItems[0]?.name || '',
    department: 'kitchen',
    servingSize: '1 Serving Portion',
    version: '1.0',
    ingredients: [],
    instructions: ['Prepare and wash fresh ingredients.', 'Cook according to temperature standards.'],
  });

  // Filtered raw materials
  const filteredItems = useMemo(() => {
    return stockItems.filter((i) => {
      const matchesSearch =
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.sku.toLowerCase().includes(search.toLowerCase()) ||
        i.supplier.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || i.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [stockItems, search, selectedCategory]);

  // Recipe metrics calculations
  const recipeBreakdowns = useMemo(() => {
    return menuItems.map((item) => {
      const recipe = recipes.find((r) => r.menuItemId === item.id || r.id === item.recipeId || r.menuItemName.toLowerCase() === item.name.toLowerCase());
      if (!recipe) {
        return {
          menuItem: item,
          recipe: null,
          plateCost: 0,
          foodCostPct: 0,
          grossProfit: item.price,
          grossMarginPct: 100,
          availablePortions: 0,
          status: 'warning' as const,
        };
      }
      const breakdown = getRecipeBreakdown(recipe, item, stockItems);
      return {
        menuItem: item,
        recipe,
        plateCost: breakdown.totalCostRwf,
        foodCostPct: breakdown.foodCostPercentage,
        grossProfit: breakdown.grossProfitRwf,
        grossMarginPct: breakdown.grossMarginPercentage,
        availablePortions: breakdown.availablePortions,
        status: breakdown.status,
      };
    });
  }, [menuItems, recipes, stockItems]);

  const averageFoodCostPct = useMemo(() => {
    const withRecipes = recipeBreakdowns.filter((b) => b.recipe !== null && b.plateCost > 0);
    if (withRecipes.length === 0) return 31.5;
    const sum = withRecipes.reduce((acc, curr) => acc + curr.foodCostPct, 0);
    return Math.round((sum / withRecipes.length) * 10) / 10;
  }, [recipeBreakdowns]);

  const averageGrossMarginPct = useMemo(() => {
    const withRecipes = recipeBreakdowns.filter((b) => b.recipe !== null && b.plateCost > 0);
    if (withRecipes.length === 0) return 68.5;
    const sum = withRecipes.reduce((acc, curr) => acc + curr.grossMarginPct, 0);
    return Math.round((sum / withRecipes.length) * 10) / 10;
  }, [recipeBreakdowns]);

  const lowStockCount = useMemo(() => {
    return stockItems.filter(
      (i) => i.centralStock <= i.minThreshold || i.kitchenStock <= 2 || i.barStock <= 2
    ).length;
  }, [stockItems]);

  // Handle opening recipe modal for creation or edit
  const openRecipeModal = (item?: MenuItem, existingRec?: Recipe | null) => {
    const targetItem = item || menuItems[0];
    const rec = existingRec || recipes.find((r) => r.menuItemId === targetItem?.id || r.id === targetItem?.recipeId);

    if (rec) {
      setEditingRecipe(rec);
      setRecipeForm({
        id: rec.id,
        menuItemId: rec.menuItemId,
        menuItemName: rec.menuItemName,
        department: rec.department,
        servingSize: rec.servingSize,
        version: rec.version,
        ingredients: [...rec.ingredients],
        instructions: [...rec.instructions],
      });
    } else {
      setEditingRecipe(null);
      setRecipeForm({
        menuItemId: targetItem?.id || '',
        menuItemName: targetItem?.name || '',
        department: targetItem?.department || 'kitchen',
        servingSize: '1 Plate / Portion',
        version: '1.0',
        ingredients: [
          {
            stockItemId: stockItems[0]?.id || '',
            stockItemName: stockItems[0]?.name || '',
            quantity: 0.25,
            unit: stockItems[0]?.unit || 'kg',
          },
        ],
        instructions: ['Scale and prepare all raw ingredients according to chef weights.'],
      });
    }
    setIsRecipeModalOpen(true);
  };

  // Recipe Form Ingredient Handlers
  const handleAddIngredientRow = () => {
    const defaultStock = stockItems[0];
    setRecipeForm((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          stockItemId: defaultStock?.id || '',
          stockItemName: defaultStock?.name || '',
          quantity: 0.1,
          unit: defaultStock?.unit || 'kg',
        },
      ],
    }));
  };

  const handleUpdateIngredientRow = (
    index: number,
    field: 'stockItemId' | 'quantity',
    value: any
  ) => {
    setRecipeForm((prev) => {
      const nextIngs = [...prev.ingredients];
      if (field === 'stockItemId') {
        const selected = stockItems.find((s) => s.id === value);
        nextIngs[index] = {
          ...nextIngs[index],
          stockItemId: value,
          stockItemName: selected?.name || '',
          unit: selected?.unit || 'kg',
        };
      } else {
        nextIngs[index] = {
          ...nextIngs[index],
          quantity: Math.max(0.001, parseFloat(value) || 0),
        };
      }
      return { ...prev, ingredients: nextIngs };
    });
  };

  const handleRemoveIngredientRow = (index: number) => {
    setRecipeForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  // Live calculation inside modal
  const modalLiveCost = useMemo(() => {
    return Math.round(
      recipeForm.ingredients.reduce((total, ing) => {
        const stock = stockItems.find((s) => s.id === ing.stockItemId);
        return total + (stock?.costPerUnit || 0) * ing.quantity;
      }, 0)
    );
  }, [recipeForm.ingredients, stockItems]);

  const targetMenuItem = useMemo(() => {
    return menuItems.find((m) => m.id === recipeForm.menuItemId);
  }, [menuItems, recipeForm.menuItemId]);

  const modalSellingPrice = targetMenuItem?.price || 0;
  const modalFoodCostPct = calculateFoodCostPercentage(modalLiveCost, modalSellingPrice);
  const modalProfit = Math.max(0, modalSellingPrice - modalLiveCost);

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeForm.menuItemId) return;

    if (editingRecipe) {
      updateRecipe(editingRecipe.id, {
        servingSize: recipeForm.servingSize,
        department: recipeForm.department,
        ingredients: recipeForm.ingredients,
        instructions: recipeForm.instructions,
      });
    } else {
      addRecipe({
        menuItemId: recipeForm.menuItemId,
        menuItemName: targetMenuItem?.name || recipeForm.menuItemName,
        department: recipeForm.department,
        servingSize: recipeForm.servingSize,
        version: recipeForm.version,
        ingredients: recipeForm.ingredients,
        instructions: recipeForm.instructions,
      });
    }

    setIsRecipeModalOpen(false);
    evaluateMenuItemAvailability();
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    addStockItem(newItem);
    setIsAddModalOpen(false);
    setNewItem({
      sku: `ING-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'produce',
      unit: 'kg',
      centralStock: 10,
      kitchenStock: 0,
      barStock: 0,
      minThreshold: 5,
      costPerUnit: 1500,
      supplier: 'Local Farm Partner',
      expiryDate: '2026-12-31',
      batchNumber: 'BAT-2026-001',
      storageLocation: 'General Dry Storage',
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
            Central Inventory & Recipe Architecture
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Package className="w-6 h-6 text-[#0E382B] dark:text-[#D4AF37]" />
            <span>Stock Inventory & Recipe Costing Management</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Connect menu items, raw ingredient stock, server delivery deductions, and real-time food cost margins.
          </p>
        </div>

        {/* Tab switch pills */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 max-w-full">
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-1 rounded-xl text-xs font-semibold overflow-x-auto scrollbar-none max-w-full">
            <button
              onClick={() => setActiveTab('recipes')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'recipes'
                  ? 'bg-white dark:bg-stone-800 text-[#0E382B] dark:text-[#D4AF37] shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#B89320]" />
              <span>Recipe Costing</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Raw Materials
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <span>Requisitions</span>
              {stockRequests.filter((r) => r.status === 'pending').length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 font-bold">
                  {stockRequests.filter((r) => r.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'movements'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Movement Ledger
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openRecipeModal()}
              className="min-h-[38px] px-3 py-2 rounded-lg bg-[#0E382B] text-[#F3DF95] border border-[#D4AF37]/60 font-semibold text-xs hover:bg-[#154636] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Link Recipe</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="min-h-[38px] px-3 py-2 rounded-lg bg-stone-900 dark:bg-stone-800 text-white font-semibold text-xs hover:bg-stone-800 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>Add Material</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: RECIPE-BASED COSTING & INGREDIENT INVENTORY */}
      {activeTab === 'recipes' && (
        <div className="space-y-6">
          {/* KPI Strip: Food Cost %, Margins, and Coverage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#121614] border border-[#D4AF37]/35 dark:border-stone-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Average Food Cost
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-[#0E382B] dark:text-[#D4AF37] tabular-nums">
                  {averageFoodCostPct}%
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Target: 28%–35%
                </span>
              </div>
              <p className="text-[11px] text-stone-400">Weighted plate ingredient cost across active recipes</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#121614] border border-[#D4AF37]/35 dark:border-stone-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Average Gross Margin
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {averageGrossMarginPct}%
                </span>
                <span className="text-[10px] text-stone-400">High Profitability</span>
              </div>
              <p className="text-[11px] text-stone-400">Average margin after deducting raw ingredient expenses</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#121614] border border-[#D4AF37]/35 dark:border-stone-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Recipe Coverage
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-stone-900 dark:text-stone-100 tabular-nums">
                  {recipes.length} / {menuItems.length}
                </span>
                <span className="text-[10px] text-[#B89320] font-bold">Menu Dishes Linked</span>
              </div>
              <p className="text-[11px] text-stone-400">Dishes with automatic ingredient consumption tracking</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#121614] border border-[#D4AF37]/35 dark:border-stone-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Low Stock Threshold Alerts
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black font-mono tabular-nums ${lowStockCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {lowStockCount} Items
                </span>
                {lowStockCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                    Restock Urgent
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400">Raw materials near or below minimum buffer threshold</p>
            </div>
          </div>

          {/* Recipe Breakdown & Margin Table */}
          <div className="bg-white dark:bg-[#121614] rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs space-y-4 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#B89320]" />
                  <span>Recipe-to-Ingredient Costing Matrix</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Real-time FIFO ingredient deductions, theoretical plate costs, and active prep portions.
                </p>
              </div>

              <div className="text-xs text-stone-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" /> Optimal (&lt;32%)</span>
                <span className="inline-flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" /> Fair (33%–42%)</span>
                <span className="inline-flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500" /> High Cost (&gt;42%)</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-900/50 text-stone-500 uppercase text-[10px] tracking-wider border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="py-3 px-3">Menu Item</th>
                    <th className="py-3 px-3">Dept</th>
                    <th className="py-3 px-3 text-right">Selling Price</th>
                    <th className="py-3 px-3 text-right">Recipe Cost</th>
                    <th className="py-3 px-3 text-right">Gross Profit</th>
                    <th className="py-3 px-3 text-center">Food Cost %</th>
                    <th className="py-3 px-3 text-right">Line Stock</th>
                    <th className="py-3 px-3 text-center">Availability</th>
                    <th className="py-3 px-3 text-center">Recipe Specs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                  {recipeBreakdowns.map(({ menuItem, recipe, plateCost, foodCostPct, grossProfit, grossMarginPct, availablePortions, status }) => {
                    return (
                      <tr key={menuItem.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/30 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-stone-900 dark:text-stone-100">{menuItem.name}</div>
                          <div className="text-[10px] text-stone-400 line-clamp-1">
                            {recipe ? recipe.servingSize : 'No linked recipe'}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="capitalize px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 w-fit bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700">
                            {menuItem.department === 'kitchen' ? (
                              <ChefHat className="w-3 h-3 text-[#B89320]" />
                            ) : (
                              <Wine className="w-3 h-3 text-rose-400" />
                            )}
                            <span>{menuItem.department}</span>
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                          {menuItem.price.toLocaleString()} RWF
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-stone-700 dark:text-stone-300 tabular-nums">
                          {plateCost > 0 ? `${plateCost.toLocaleString()} RWF` : '—'}
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                          {plateCost > 0 ? (
                            <div>
                              <span>{grossProfit.toLocaleString()} RWF</span>
                              <div className="text-[9px] text-stone-400 font-sans">{grossMarginPct}% Margin</div>
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {plateCost > 0 ? (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border inline-block ${
                                status === 'optimal'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                  : status === 'warning'
                                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                              }`}
                            >
                              {foodCostPct}%
                            </span>
                          ) : (
                            <span className="text-stone-400 italic text-[11px]">Unlinked</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right font-mono tabular-nums">
                          {recipe ? (
                            <div>
                              <span
                                className={`font-bold ${
                                  availablePortions === 0
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : availablePortions < 5
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-stone-900 dark:text-stone-100'
                                }`}
                              >
                                {availablePortions} portions
                              </span>
                              <div className="text-[9px] text-stone-400 font-sans">available in line</div>
                            </div>
                          ) : (
                            <span className="text-stone-400">—</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {menuItem.isAvailable ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] border border-emerald-300 dark:border-emerald-800">
                              Active In Menu
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[10px] border border-rose-300 dark:border-rose-800">
                              Auto Sold-Out
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => openRecipeModal(menuItem, recipe)}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center gap-1 mx-auto transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#B89320]" />
                            <span>{recipe ? 'Edit Recipe' : '+ Link Recipe'}</span>
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

      {/* TAB 2: INVENTORY DIRECTORY (RAW MATERIALS) */}
      {activeTab === 'dashboard' && (
        <div className="bg-white dark:bg-[#121614] rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs space-y-4 p-4 sm:p-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1 text-xs">
              {(['all', 'meat', 'produce', 'beverage', 'dairy', 'dry_goods'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search raw ingredient or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-900/50 text-stone-500 uppercase text-[10px] tracking-wider border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-3 px-3">SKU & Item Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Central Warehouse</th>
                  <th className="py-3 px-3 text-right">Kitchen Prep Line</th>
                  <th className="py-3 px-3 text-right">Bar Reserve</th>
                  <th className="py-3 px-3 text-right">Unit Cost</th>
                  <th className="py-3 px-3">Batch / Expiry</th>
                  <th className="py-3 px-3">Storage Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {filteredItems.map((item) => {
                  const isLow = item.centralStock <= item.minThreshold;
                  return (
                    <tr key={item.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-stone-900 dark:text-stone-100">{item.name}</div>
                        <div className="text-[10px] text-stone-400 font-mono">{item.sku}</div>
                      </td>

                      <td className="py-3 px-3 capitalize text-stone-600 dark:text-stone-400">
                        {item.category.replace('_', ' ')}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                        <span
                          className={isLow ? 'text-amber-600 dark:text-amber-400 flex items-center justify-end gap-1' : 'text-stone-900 dark:text-stone-100'}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                          {item.centralStock} {item.unit}
                        </span>
                        {isLow && (
                          <div className="text-[9px] text-amber-600 font-sans font-normal">
                            Min: {item.minThreshold} {item.unit}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        <span className={item.kitchenStock === 0 && item.category !== 'beverage' ? 'text-rose-500 font-bold' : 'text-stone-700 dark:text-stone-300'}>
                          {item.kitchenStock} {item.unit}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        <span className={item.barStock === 0 && item.category === 'beverage' ? 'text-rose-500 font-bold' : 'text-stone-700 dark:text-stone-300'}>
                          {item.barStock} {item.unit}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-semibold text-stone-800 dark:text-stone-200 tabular-nums">
                        {item.costPerUnit.toLocaleString()} RWF / {item.unit}
                      </td>

                      <td className="py-3 px-3 text-stone-600 dark:text-stone-400 font-mono text-[11px]">
                        <div>{item.batchNumber}</div>
                        <div className="text-[10px] text-stone-400">Exp: {item.expiryDate}</div>
                      </td>

                      <td className="py-3 px-3 text-stone-600 dark:text-stone-400">
                        {item.storageLocation}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REQUISITIONS QUEUE */}
      {activeTab === 'requests' && (
        <div className="bg-white dark:bg-[#121614] rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                Department Supply Requisitions
              </h3>
              <p className="text-xs text-stone-500">
                Approve and issue raw ingredients from central warehouse to kitchen and bar production lines.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {stockRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-emerald-900 dark:text-emerald-300">
                      {req.reference}
                    </span>
                    <span className="text-xs font-semibold capitalize px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      {req.department} Line
                    </span>
                    <span className="text-xs text-stone-500">Requested by: <strong>{req.requestedBy}</strong></span>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold capitalize ${
                      req.status === 'issued'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : req.status === 'approved'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {req.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {req.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-semibold text-stone-900 dark:text-stone-100">{it.itemName}</div>
                        <div className="text-[10px] text-stone-400">SKU: {it.itemId}</div>
                      </div>
                      <div className="text-right font-mono font-bold text-stone-800 dark:text-stone-200 tabular-nums">
                        {it.requestedQty} {it.unit}
                      </div>
                    </div>
                  ))}
                </div>

                {req.notes && <div className="text-xs text-stone-500 italic">Notes: "{req.notes}"</div>}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800 text-xs">
                  {req.status === 'pending' && (
                    <button
                      onClick={() =>
                        approveStockRequest(
                          req.id,
                          'Central Warehouse Manager',
                          req.items.map((i) => ({ itemId: i.itemId, approvedQty: i.requestedQty }))
                        )
                      }
                      className="px-4 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold transition-colors shadow-xs cursor-pointer"
                    >
                      Approve Requisition
                    </button>
                  )}

                  {req.status === 'approved' && (
                    <button
                      onClick={() => issueStock(req.id, 'Central Warehouse Manager')}
                      className="px-4 py-2 rounded-lg bg-emerald-900 dark:bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Issue Stock from Warehouse</span>
                    </button>
                  )}

                  {req.status === 'issued' && (
                    <div className="text-emerald-700 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Fulfilled and logged to movement ledger
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MOVEMENT LEDGER (AUDITABLE INVENTORY LOG) */}
      {activeTab === 'movements' && (
        <div className="bg-white dark:bg-[#121614] rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                Auditable Stock Movement Ledger
              </h3>
              <p className="text-xs text-stone-500">
                Complete trace of every purchase receipt, department issuance, and recipe-based order consumption event.
              </p>
            </div>
            <span className="font-mono text-xs text-stone-500">{stockMovements.length} Records</span>
          </div>

          <div className="space-y-3">
            {stockMovements.map((mov) => {
              const isConsumption = mov.type === 'consumption';
              return (
                <div
                  key={mov.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    isConsumption
                      ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-emerald-900 dark:text-emerald-300">
                        {mov.reference}
                      </span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        {mov.productName}
                      </span>
                      <span
                        className={`capitalize px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isConsumption
                            ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                            : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {mov.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-stone-500 text-[11px]">
                      From: <strong className="text-stone-700 dark:text-stone-300">{mov.source}</strong> → To:{' '}
                      <strong className="text-stone-700 dark:text-stone-300">{mov.destination}</strong> · Handler:{' '}
                      {mov.employeeName}
                    </div>
                    {mov.reason && <div className="text-[11px] text-stone-600 dark:text-stone-400 italic">{mov.reason}</div>}
                  </div>

                  <div className="text-right font-mono font-bold text-sm tabular-nums shrink-0">
                    <span className={isConsumption || mov.type.includes('issuance') ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}>
                      {mov.type.includes('issuance') || isConsumption ? '-' : '+'}
                      {mov.quantity} {mov.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RECIPE BUILDER & INGREDIENT LINKER MODAL */}
      {isRecipeModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#121614] rounded-3xl border border-[#D4AF37]/50 max-w-2xl w-full max-h-[92dvh] overflow-y-auto p-4 sm:p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-[#B89320] uppercase tracking-wider block">
                  Recipe Specification & Portions
                </span>
                <h3 className="font-extrabold text-base sm:text-lg text-stone-900 dark:text-stone-100 truncate">
                  {editingRecipe ? 'Edit Recipe & Raw Ingredient Links' : 'Link New Dish to Raw Ingredients'}
                </h3>
              </div>
              <button
                onClick={() => setIsRecipeModalOpen(false)}
                aria-label="Close modal"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Select Menu Dish *
                  </label>
                  <select
                    disabled={!!editingRecipe}
                    value={recipeForm.menuItemId}
                    onChange={(e) => {
                      const sel = menuItems.find((m) => m.id === e.target.value);
                      setRecipeForm({
                        ...recipeForm,
                        menuItemId: e.target.value,
                        menuItemName: sel?.name || '',
                        department: sel?.department || 'kitchen',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden font-semibold cursor-pointer"
                  >
                    {menuItems.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.price.toLocaleString()} RWF · {m.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Serving Size / Portion Spec
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 Plate (250g tenderloin) or 1 Highball (350ml)"
                    value={recipeForm.servingSize}
                    onChange={(e) => setRecipeForm({ ...recipeForm, servingSize: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Raw Ingredient Breakdown Rows */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-[#B89320]" />
                    <span>Raw Ingredients per Portion</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAddIngredientRow}
                    className="px-2.5 py-1 rounded-lg bg-[#0E382B] text-[#F3DF95] text-[11px] font-bold hover:bg-[#154636] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Ingredient</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {recipeForm.ingredients.map((ing, idx) => {
                    const stock = stockItems.find((s) => s.id === ing.stockItemId);
                    const lineCost = Math.round((stock?.costPerUnit || 0) * ing.quantity);

                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 flex flex-col sm:flex-row sm:items-center gap-2 text-xs"
                      >
                        <div className="w-full sm:flex-1 min-w-0">
                          <select
                            value={ing.stockItemId}
                            onChange={(e) => handleUpdateIngredientRow(idx, 'stockItemId', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:outline-hidden"
                          >
                            {stockItems.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.costPerUnit.toLocaleString()} RWF / {s.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                          <div className="w-28 sm:w-24 shrink-0 flex items-center gap-1">
                            <input
                              type="number"
                              step="0.001"
                              min="0.001"
                              value={ing.quantity}
                              onChange={(e) => handleUpdateIngredientRow(idx, 'quantity', e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono text-xs text-right focus:outline-hidden"
                            />
                            <span className="text-[10px] text-stone-500 font-mono">{ing.unit}</span>
                          </div>

                          <div className="w-24 text-right font-mono font-bold text-stone-800 dark:text-stone-200 tabular-nums shrink-0">
                            {lineCost.toLocaleString()} RWF
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveIngredientRow(idx)}
                            className="min-h-[34px] min-w-[34px] flex items-center justify-center p-1 rounded text-stone-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                            title="Remove ingredient"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Costing & Profit Margin Simulator Box */}
              <div className="p-3.5 rounded-2xl bg-[#0E382B] text-white border border-[#D4AF37]/50 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-[#D4AF37]/30 pb-2">
                  <span className="text-stone-300 font-medium">Selling Price on Menu:</span>
                  <span className="font-mono font-bold text-base text-[#F3DF95] tabular-nums">
                    {modalSellingPrice.toLocaleString()} RWF
                  </span>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 text-center text-xs pt-1 font-mono">
                  <div>
                    <span className="text-[10px] text-stone-300 block font-sans">Recipe Cost</span>
                    <span className="font-bold text-sm text-stone-100 tabular-nums">
                      {modalLiveCost.toLocaleString()} RWF
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-300 block font-sans">Food Cost %</span>
                    <span
                      className={`font-black text-sm tabular-nums ${
                        modalFoodCostPct <= 32
                          ? 'text-emerald-400'
                          : modalFoodCostPct <= 42
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {modalFoodCostPct}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-300 block font-sans">Gross Profit</span>
                    <span className="font-bold text-sm text-emerald-300 tabular-nums">
                      {modalProfit.toLocaleString()} RWF
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecipeModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0E382B] hover:bg-[#154636] text-[#FAF6EB] border border-[#D4AF37]/70 font-bold text-xs transition-colors shadow-md cursor-pointer"
                >
                  Save Recipe & Calibrate Availability
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER RAW INVENTORY PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
          <div className="bg-white dark:bg-[#121614] rounded-2xl border border-stone-200 dark:border-stone-800 max-w-lg w-full max-h-[92dvh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                Register New Inventory Product
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close modal"
                className="min-h-[38px] min-w-[38px] flex items-center justify-center p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Prime Cut Ribeye"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  >
                    <option value="produce">Produce</option>
                    <option value="meat">Meat & Poultry</option>
                    <option value="dairy">Dairy</option>
                    <option value="beverage">Beverage & Alcohol</option>
                    <option value="dry_goods">Dry Goods & Spices</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Initial Central Stock
                  </label>
                  <input
                    type="number"
                    value={newItem.centralStock}
                    onChange={(e) => setNewItem({ ...newItem, centralStock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Unit Cost (RWF)
                  </label>
                  <input
                    type="number"
                    value={newItem.costPerUnit}
                    onChange={(e) => setNewItem({ ...newItem, costPerUnit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Storage Location
                  </label>
                  <input
                    type="text"
                    value={newItem.storageLocation}
                    onChange={(e) => setNewItem({ ...newItem, storageLocation: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="min-h-[40px] px-3 py-1.5 rounded-lg text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] px-4 py-2 rounded-lg bg-[#0E382B] text-white font-bold text-xs hover:bg-[#154636] cursor-pointer"
                >
                  Register & Receive Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
