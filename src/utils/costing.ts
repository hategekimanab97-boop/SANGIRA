import { Recipe, StockItem, MenuItem } from '../types';

export interface RecipeCostBreakdown {
  recipeId: string;
  menuItemId: string;
  menuItemName: string;
  totalCostRwf: number;
  sellingPriceRwf: number;
  foodCostPercentage: number;
  grossProfitRwf: number;
  grossMarginPercentage: number;
  availablePortions: number;
  status: 'optimal' | 'warning' | 'critical';
  ingredientDetails: {
    stockItemId: string;
    stockItemName: string;
    quantity: number;
    unit: string;
    unitCostRwf: number;
    ingredientCostRwf: number;
    departmentStock: number;
  }[];
}

/**
 * Calculates theoretical plate cost of a recipe based on current raw stock item costs.
 */
export function calculateRecipeCost(recipe: Recipe, stockItems: StockItem[]): number {
  if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
    return 0;
  }

  return Math.round(
    recipe.ingredients.reduce((total, ing) => {
      const stock = stockItems.find((s) => s.id === ing.stockItemId);
      if (!stock) return total;
      // Unit cost * quantity required for 1 plate/serving
      const itemCost = (stock.costPerUnit || 0) * ing.quantity;
      return total + itemCost;
    }, 0)
  );
}

/**
 * Calculates food cost percentage: (Recipe Cost / Selling Price) * 100
 * Industry target for restaurant food cost is typically 28% - 35%.
 */
export function calculateFoodCostPercentage(recipeCost: number, sellingPrice: number): number {
  if (sellingPrice <= 0) return 0;
  const pct = (recipeCost / sellingPrice) * 100;
  return Math.round(pct * 10) / 10;
}

/**
 * Calculates gross profit in RWF and gross margin %
 */
export function calculateGrossMargin(recipeCost: number, sellingPrice: number): {
  grossProfitRwf: number;
  grossMarginPercentage: number;
} {
  const profit = Math.max(0, sellingPrice - recipeCost);
  const marginPct = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
  return {
    grossProfitRwf: profit,
    grossMarginPercentage: Math.round(marginPct * 10) / 10,
  };
}

/**
 * Calculates how many complete portions can be prepared from current department stock.
 */
export function calculateAvailablePortions(
  recipe: Recipe,
  stockItems: StockItem[]
): number {
  if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
    return 999;
  }

  let minPortions = Infinity;

  for (const ing of recipe.ingredients) {
    const stock = stockItems.find((s) => s.id === ing.stockItemId);
    if (!stock || ing.quantity <= 0) {
      minPortions = 0;
      break;
    }

    // Determine available department stock (kitchenStock for kitchen, barStock for bar)
    const availableStock = recipe.department === 'bar' ? stock.barStock : stock.kitchenStock;
    const portionsForThisIngredient = Math.floor(availableStock / ing.quantity);

    if (portionsForThisIngredient < minPortions) {
      minPortions = portionsForThisIngredient;
    }
  }

  return minPortions === Infinity ? 0 : Math.max(0, minPortions);
}

/**
 * Generates a full costing and margin breakdown for a dish.
 */
export function getRecipeBreakdown(
  recipe: Recipe,
  menuItem: MenuItem,
  stockItems: StockItem[]
): RecipeCostBreakdown {
  const sellingPrice = menuItem.price;
  let totalCost = 0;

  const ingredientDetails = recipe.ingredients.map((ing) => {
    const stock = stockItems.find((s) => s.id === ing.stockItemId);
    const unitCost = stock?.costPerUnit || 0;
    const ingredientCost = Math.round(unitCost * ing.quantity);
    totalCost += ingredientCost;

    const departmentStock = stock
      ? recipe.department === 'bar'
        ? stock.barStock
        : stock.kitchenStock
      : 0;

    return {
      stockItemId: ing.stockItemId,
      stockItemName: ing.stockItemName || stock?.name || 'Raw Ingredient',
      quantity: ing.quantity,
      unit: ing.unit,
      unitCostRwf: unitCost,
      ingredientCostRwf: ingredientCost,
      departmentStock,
    };
  });

  const foodCostPercentage = calculateFoodCostPercentage(totalCost, sellingPrice);
  const { grossProfitRwf, grossMarginPercentage } = calculateGrossMargin(totalCost, sellingPrice);
  const availablePortions = calculateAvailablePortions(recipe, stockItems);

  // Status benchmarks: optimal (<= 32%), warning (33% - 42%), critical (> 42%)
  let status: 'optimal' | 'warning' | 'critical' = 'optimal';
  if (foodCostPercentage > 42) {
    status = 'critical';
  } else if (foodCostPercentage > 32) {
    status = 'warning';
  }

  return {
    recipeId: recipe.id,
    menuItemId: menuItem.id,
    menuItemName: menuItem.name,
    totalCostRwf: totalCost,
    sellingPriceRwf: sellingPrice,
    foodCostPercentage,
    grossProfitRwf,
    grossMarginPercentage,
    availablePortions,
    status,
    ingredientDetails,
  };
}
