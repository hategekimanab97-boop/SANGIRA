import React, { useState, useRef } from 'react';
import { useSangira } from '../../../context/SangiraContext';
import { useLanguage } from '../../../context/LanguageContext';
import { MenuItem } from '../../../types';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Upload,
  Link2,
  Sparkles,
  Edit3,
  Trash2,
  Check,
  X,
  ChefHat,
  Wine,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Filter,
  Cake,
  Receipt,
  Scale,
} from 'lucide-react';
import { calculateRecipeCost, calculateFoodCostPercentage, calculateGrossMargin } from '../../../utils/costing';

// Curated high-res Rwandan culinary presets for instant launch
const CULINARY_PRESETS: {
  name: string;
  url: string;
  category: MenuItem['category'];
  department: 'kitchen' | 'bar';
}[] = [
  {
    name: 'Charcoal Grilled Beef Tenderloin',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    category: 'main',
    department: 'kitchen',
  },
  {
    name: 'Fresh Lake Kivu Crispy Tilapia',
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    category: 'main',
    department: 'kitchen',
  },
  {
    name: 'Gishwati Gouda Artisan Burger',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    category: 'main',
    department: 'kitchen',
  },
  {
    name: 'Virunga Fresh Mint Mojito',
    url: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=800&q=80',
    category: 'cocktail',
    department: 'bar',
  },
  {
    name: 'Rwandan Yellow Passion Cooler',
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    category: 'beverage',
    department: 'bar',
  },
  {
    name: 'Bourbon Vanilla Molten Lava Cake',
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    category: 'dessert',
    department: 'kitchen',
  },
];

export const MenuManagementView: React.FC = () => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, activeBusiness, recipes, stockItems } = useSangira();
  const { translateDescription } = useLanguage();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'kitchen' | 'bar' | 'dessert'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Modal Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<MenuItem['category']>('main');
  const [formDept, setFormDept] = useState<'kitchen' | 'bar'>('kitchen');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('12000');
  const [formPrepTime, setFormPrepTime] = useState('15');
  const [formDietary, setFormDietary] = useState('Chef Special');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'link' | 'presets'>('upload');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('main');
    setFormDept('kitchen');
    setFormDesc('');
    setFormPrice('12000');
    setFormPrepTime('15');
    setFormDietary('Chef Special');
    setFormImageUrl(CULINARY_PRESETS[0].url);
    setImageSourceMode('upload');
    setUploadError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormDept(item.department);
    setFormDesc(item.description);
    setFormPrice(item.price.toString());
    setFormPrepTime(item.prepTimeMinutes.toString());
    setFormDietary((item.dietary || []).join(', '));
    setFormImageUrl(item.imageUrl || '');
    setImageSourceMode('link');
    setUploadError(null);
    setIsModalOpen(true);
  };

  // Handle local browser photo upload via FileReader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP, etc.)');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB. Please choose a smaller photo.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const priceNum = parseInt(formPrice.replace(/[^0-9]/g, ''), 10) || 5000;
    const prepNum = parseInt(formPrepTime.replace(/[^0-9]/g, ''), 10) || 15;
    const dietaryArray = formDietary
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    const fallbackUrl = formDept === 'kitchen' ? CULINARY_PRESETS[0].url : CULINARY_PRESETS[3].url;
    const finalImageUrl = formImageUrl.trim() || fallbackUrl;

    if (editingItem) {
      updateMenuItem(editingItem.id, {
        name: formName.trim(),
        category: formCategory,
        department: formDept,
        description: formDesc.trim(),
        price: priceNum,
        prepTimeMinutes: prepNum,
        dietary: dietaryArray,
        imageUrl: finalImageUrl,
      });
    } else {
      addMenuItem({
        name: formName.trim(),
        category: formCategory,
        department: formDept,
        description: formDesc.trim(),
        price: priceNum,
        isAvailable: true,
        prepTimeMinutes: prepNum,
        dietary: dietaryArray,
        imageUrl: finalImageUrl,
      });
    }

    setIsModalOpen(false);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'kitchen' && item.department === 'kitchen' && item.category !== 'dessert') ||
      (selectedCategory === 'bar' && item.department === 'bar') ||
      (selectedCategory === 'dessert' && item.category === 'dessert');
    const matchesSearch =
      !search.trim() ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryCounts = {
    all: menuItems.length,
    kitchen: menuItems.filter((i) => i.department === 'kitchen' && i.category !== 'dessert').length,
    bar: menuItems.filter((i) => i.department === 'bar').length,
    dessert: menuItems.filter((i) => i.category === 'dessert').length,
  };
  const availableCount = menuItems.filter((i) => i.isAvailable).length;

  const linkedCount = recipes.filter((r) => menuItems.some((m) => m.id === r.menuItemId)).length;
  const avgFoodCostPct =
    linkedCount > 0
      ? recipes.reduce((acc, r) => {
          const item = menuItems.find((m) => m.id === r.menuItemId);
          if (!item || item.price <= 0) return acc;
          const cost = calculateRecipeCost(r, stockItems);
          return acc + calculateFoodCostPercentage(cost, item.price);
        }, 0) / linkedCount
      : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4AF37]/30 pb-4">
        <div>
          <span className="text-[11px] font-bold text-[#B89320] dark:text-[#D4AF37] uppercase tracking-wider">
            Restaurant & Bar Catalog
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-[#D4AF37]" />
            Digital Menu & Recipe Costing
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Manage culinary catalog, photos, and live recipe-to-ingredient plate costing with real-time inventory tracking.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0E382B] hover:bg-[#144737] text-[#FAF6EB] border border-[#D4AF37]/80 font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-[#F3DF95]">Add Menu Product</span>
        </button>
      </div>

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[#D4AF37]/35 dark:border-[#D4AF37]/25 bg-[#FFFDF9] dark:bg-[#121614] shadow-xs">
          <div className="text-xs text-stone-500">Total Catalog Items</div>
          <div className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1 tabular-nums">
            {menuItems.length}
          </div>
          <div className="text-[11px] text-[#B89320] dark:text-[#D4AF37] mt-0.5">{availableCount} active for ordering</div>
        </div>

        <div className="p-4 rounded-xl border border-[#D4AF37]/35 dark:border-[#D4AF37]/25 bg-[#FFFDF9] dark:bg-[#121614] shadow-xs">
          <div className="text-xs text-stone-500">Recipe Coverage</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {linkedCount} / {menuItems.length}
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">Automated stock deduction</div>
        </div>

        <div className="p-4 rounded-xl border border-[#D4AF37]/35 dark:border-[#D4AF37]/25 bg-[#FFFDF9] dark:bg-[#121614] shadow-xs">
          <div className="text-xs text-stone-500">Average Food Cost %</div>
          <div className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400 mt-1 tabular-nums">
            {avgFoodCostPct.toFixed(1)}%
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">Target: 28% - 35%</div>
        </div>

        <div className="p-4 rounded-xl border border-[#D4AF37]/35 dark:border-[#D4AF37]/25 bg-[#FFFDF9] dark:bg-[#121614] shadow-xs">
          <div className="text-xs text-stone-500">Category Balance</div>
          <div className="text-2xl font-bold font-mono text-[#D4AF37] mt-1 tabular-nums">
            {categoryCounts.kitchen}K / {categoryCounts.bar}B
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">Kitchen vs Bar drinks</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFDF9] dark:bg-[#121614] p-3 rounded-2xl border border-[#D4AF37]/30 shadow-xs">
        {/* Category tabs: All Items, Main Kitchen, Bar & Cocktails, Dessert */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none max-w-full pb-0.5">
          {[
            {
              id: 'all',
              label: 'All Items',
              icon: UtensilsCrossed,
              count: categoryCounts.all,
              accentColor: 'text-[#D4AF37]',
            },
            {
              id: 'kitchen',
              label: 'Main Kitchen',
              icon: ChefHat,
              count: categoryCounts.kitchen,
              accentColor: 'text-amber-500',
            },
            {
              id: 'bar',
              label: 'Bar & Cocktails',
              icon: Wine,
              count: categoryCounts.bar,
              accentColor: 'text-rose-400',
            },
            {
              id: 'dessert',
              label: 'Dessert',
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
                onClick={() => setSelectedCategory(c.id as any)}
                className={`group relative flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl font-medium text-xs whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#0E382B] text-white border-[#D4AF37] shadow-sm scale-[1.02]'
                    : 'bg-white/70 dark:bg-stone-900/60 hover:bg-white dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border-[#D4AF37]/25 hover:border-[#D4AF37]/50'
                }`}
              >
                <span
                  className={`p-1 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-[#D4AF37]/20 text-[#F3DF95]'
                      : `bg-stone-100 dark:bg-stone-800 ${c.accentColor} group-hover:bg-[#D4AF37]/15 group-hover:text-[#D4AF37]`
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                </span>
                <span className={`font-semibold ${isSelected ? 'text-[#F3DF95]' : ''}`}>
                  {c.label}
                </span>
                <span
                  className={`text-[10px] sm:text-xs font-mono font-bold px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-[#D4AF37] text-stone-950 shadow-xs'
                      : 'bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400 group-hover:bg-[#D4AF37]/20 group-hover:text-[#D4AF37]'
                  }`}
                >
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search dish, cocktail, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Menu Item Cards Grid: 1-col mobile, 2-col tablet, 3-col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const linkedRecipe = recipes.find((r) => r.menuItemId === item.id);
          const recipeCost = linkedRecipe ? calculateRecipeCost(linkedRecipe, stockItems) : 0;
          const foodCostPct = linkedRecipe ? calculateFoodCostPercentage(recipeCost, item.price) : 0;

          return (
            <div
              key={item.id}
              className={`bg-[#FFFDF9] dark:bg-[#111714] rounded-2xl border transition-all overflow-hidden flex flex-col shadow-xs hover:shadow-lg ${
                item.isAvailable
                  ? 'border-[#D4AF37]/35 dark:border-[#D4AF37]/25'
                  : 'border-stone-300 dark:border-stone-800 opacity-60'
              }`}
            >
              {/* Product Photo with Badges */}
              <div className="relative aspect-16/10 overflow-hidden bg-stone-900">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-800 to-stone-950 text-stone-400 p-4">
                    <ImageIcon className="w-8 h-8 mb-2 text-[#D4AF37]" />
                    <span className="text-xs">No Photo Uploaded</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs">
                  <span className="bg-black/60 backdrop-blur-md text-[#FAF6EB] font-medium px-2 py-0.5 rounded-md text-[10px] border border-white/10 flex items-center gap-1">
                    {item.department === 'kitchen' ? (
                      <ChefHat className="w-3 h-3 text-[#D4AF37]" />
                    ) : (
                      <Wine className="w-3 h-3 text-rose-400" />
                    )}
                    <span className="capitalize">{item.department}</span>
                  </span>

                  <button
                    onClick={() => updateMenuItem(item.id, { isAvailable: !item.isAvailable })}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-md border transition-all cursor-pointer flex items-center gap-1 ${
                      item.isAvailable
                        ? 'bg-emerald-900/80 text-emerald-200 border-emerald-400/30'
                        : 'bg-rose-900/80 text-rose-200 border-rose-400/30'
                    }`}
                    title={item.isAvailable ? 'Click to mark Sold Out' : 'Click to mark In Stock'}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${item.isAvailable ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span>{item.isAvailable ? 'Available' : 'Sold Out'}</span>
                  </button>
                </div>

                {/* Bottom Price in Photo Scrim */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between text-white">
                  <span className="font-mono font-bold text-base text-[#F3DF95] tabular-nums drop-shadow-sm">
                    {item.price.toLocaleString()} RWF
                  </span>
                  <span className="text-[10px] bg-black/50 px-2 py-0.5 rounded text-stone-300">
                    {item.prepTimeMinutes} mins
                  </span>
                </div>
              </div>

              {/* Item Details Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {translateDescription(item.name)}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                    {translateDescription(item.description)}
                  </p>

                  {item.dietary && item.dietary.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.dietary.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] text-stone-600 dark:text-stone-400 font-medium"
                        >
                          {tag}{idx < item.dietary!.length - 1 ? ' ·' : ''}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Magnify POS Recipe Costing Badge */}
                  {linkedRecipe ? (
                    <div className="mt-2.5 p-2 rounded-xl bg-[#FAF6EB] dark:bg-stone-900/80 border border-[#D4AF37]/35 text-[11px] flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 truncate">
                        <Scale className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                        <span className="truncate">
                          Cost: <strong className="font-mono text-stone-900 dark:text-stone-100">{recipeCost.toLocaleString()} RWF</strong>
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] shrink-0 border ${
                          foodCostPct <= 35
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300/40'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300/40'
                        }`}
                      >
                        {foodCostPct.toFixed(0)}% Cost
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2.5 p-2 rounded-xl bg-stone-100 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 text-[11px] flex items-center justify-between text-stone-500">
                      <span className="flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>No recipe linked</span>
                      </span>
                      <span className="text-[10px] text-[#B89320] font-semibold">Stock Portal</span>
                    </div>
                  )}
                </div>

              {/* Actions: Edit & Delete */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="flex-1 min-h-[38px] px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#B89320]" />
                  <span>Edit Product</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Remove "${item.name}" from digital menu?`)) {
                      deleteMenuItem(item.id);
                    }
                  }}
                  className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Delete item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
      </div>

      {/* Modal: Add / Edit Menu Item with Browser Photo Upload & Link */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#FFFDF9] dark:bg-[#121915] rounded-3xl border border-[#D4AF37]/50 max-w-2xl w-full max-h-[92dvh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-[#D4AF37]/30 flex items-center justify-between bg-[#0E382B] text-white">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
                  {editingItem ? 'Update Dish Details' : 'New Product Registration'}
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-stone-50">
                  {editingItem ? `Edit: ${editingItem.name}` : 'Add Item to Digital Menu'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveItem} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Product Photo Upload Section */}
              <div className="p-4 rounded-2xl border border-[#D4AF37]/40 bg-[#FAF6EB]/60 dark:bg-stone-900/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
                    Product Photography
                  </span>
                  <div className="flex flex-wrap items-center gap-1 bg-stone-200 dark:bg-stone-800 p-0.5 rounded-lg text-[11px] self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('upload')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        imageSourceMode === 'upload'
                          ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold shadow-xs'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      Browser Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('link')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        imageSourceMode === 'link'
                          ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold shadow-xs'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      Image Link (URL)
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('presets')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        imageSourceMode === 'presets'
                          ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold shadow-xs'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      Presets
                    </button>
                  </div>
                </div>

                {/* Mode A: Local File Upload */}
                {imageSourceMode === 'upload' && (
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="product-photo-upload"
                    />
                    <label
                      htmlFor="product-photo-upload"
                      className="w-full border-2 border-dashed border-[#D4AF37]/50 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#D4AF37]/10 transition-colors"
                    >
                      <Upload className="w-6 h-6 text-[#D4AF37] mb-1.5" />
                      <span className="font-bold text-stone-800 dark:text-stone-200">
                        Choose photo from your phone or computer
                      </span>
                      <span className="text-[11px] text-stone-500 mt-0.5">
                        Supports PNG, JPG, WebP up to 5MB
                      </span>
                    </label>
                  </div>
                )}

                {/* Mode B: Direct Image URL */}
                {imageSourceMode === 'link' && (
                  <div className="space-y-1">
                    <div className="relative">
                      <Link2 className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        placeholder="https://yourhotel.rw/images/dishes/tilapia.jpg"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                      />
                    </div>
                    <p className="text-[10px] text-stone-500">
                      Paste direct link to your food or cocktail image.
                    </p>
                  </div>
                )}

                {/* Mode C: Culinary Presets */}
                {imageSourceMode === 'presets' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {CULINARY_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormImageUrl(preset.url);
                          if (!formName) setFormName(preset.name);
                          setFormCategory(preset.category);
                          setFormDept(preset.department);
                        }}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                          formImageUrl === preset.url
                            ? 'border-[#D4AF37] bg-[#D4AF37]/15 ring-1 ring-[#D4AF37]'
                            : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <span className="text-[11px] font-medium text-stone-800 dark:text-stone-200 truncate">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {uploadError && (
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Live Photo Preview */}
                {formImageUrl && (
                  <div className="pt-2 flex items-center gap-3">
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      className="w-20 h-14 rounded-xl object-cover border border-[#D4AF37]/50 shadow-xs"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Photo Ready for Menu
                      </span>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        Customers will see this photo when browsing table menus.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Fields: Name & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Dish / Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Oak-Smoked Lake Kivu Sambaza"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Price in RWF (VAT Incl.) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="15000"
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Department & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Destination Department
                  </label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden cursor-pointer"
                  >
                    <option value="kitchen">Main Kitchen (Chef Station)</option>
                    <option value="bar">Bar & Lounge (Mixologist Station)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Menu Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MenuItem['category'])}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden cursor-pointer"
                  >
                    <option value="main">Main Entrée</option>
                    <option value="appetizer">Appetizer / Tapas</option>
                    <option value="cocktail">Cocktail</option>
                    <option value="beverage">Soft Drink & Juice</option>
                    <option value="wine">Wine & Champagne</option>
                    <option value="dessert">Dessert</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Product Description & Ingredients
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Fresh local herbs, garlic dip, and crisp hand-cut golden fries..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden resize-none"
                />
              </div>

              {/* Prep time & Dietary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Prep Time (Minutes)
                  </label>
                  <input
                    type="number"
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(e.target.value)}
                    placeholder="15"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Dietary Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formDietary}
                    onChange={(e) => setFormDietary(e.target.value)}
                    placeholder="Gluten-Free, Rwandan Organic, Spicy"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2 rounded-xl bg-[#0E382B] hover:bg-[#144737] text-[#FAF6EB] border border-[#D4AF37]/80 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Check className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[#F3DF95]">{editingItem ? 'Save Updates' : 'Publish to Digital Menu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
