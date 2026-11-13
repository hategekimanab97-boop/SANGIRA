import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Role,
  Business,
  BusinessApplication,
  Department,
  Employee,
  HotelReservation,
  HotelRoom,
  MenuItem,
  Order,
  DepartmentTicket,
  PaymentTransaction,
  Recipe,
  StaffShift,
  StockItem,
  StockMovement,
  StockRequest,
  Notification,
  AuditLog,
  CashSession,
} from '../types';
import {
  initialBusinesses,
  initialApplications,
  initialDepartments,
  initialEmployees,
  initialStockItems,
  initialStockRequests,
  initialStockMovements,
  initialMenuItems,
  initialRecipes,
  initialOrders,
  initialDepartmentTickets,
  initialPayments,
  initialHotelRooms,
  initialReservations,
  initialNotifications,
  initialAuditLogs,
} from '../data/mockData';
import { authClient } from '../lib/authClient';
import {
  sangiraApi,
  type IntegrationStatusReport,
  type StaffSessionResponse,
  type StaffUserSession,
} from '../lib/apiClient';

export type UserRoleOrPublic = Role | 'PUBLIC';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

interface SignUpStaffInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  businessId: string;
  department: string;
  phone?: string;
}

interface SangiraContextType {
  role: UserRoleOrPublic;
  setRole: (role: UserRoleOrPublic) => void;
  activeBusiness: Business;
  setActiveBusiness: (b: Business) => void;
  allBusinesses: Business[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Better Auth, Supabase PostgreSQL & Resend Status
  staffSession: StaffSessionResponse;
  currentStaffUser: StaffUserSession | null;
  isAuthReady: boolean;
  dbConnected: boolean;
  integrationStatus: IntegrationStatusReport | null;
  preKeyPreviewMode: boolean;
  setPreKeyPreviewMode: (enabled: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  lastEmailAlert: { status: 'sent' | 'missing_key' | 'error'; message: string } | null;
  clearLastEmailAlert: () => void;
  refreshIntegrationStatus: () => Promise<void>;
  refreshStaffSession: () => Promise<void>;
  signInStaff: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUpStaff: (input: SignUpStaffInput) => Promise<{ ok: boolean; error?: string }>;
  logoutUser: () => Promise<void>;
  sendTestEmail: (recipientEmail: string) => Promise<{ ok: boolean; message: string }>;

  // Data
  applications: BusinessApplication[];
  departments: Department[];
  employees: Employee[];
  shifts: StaffShift[];
  stockItems: StockItem[];
  stockRequests: StockRequest[];
  stockMovements: StockMovement[];
  menuItems: MenuItem[];
  recipes: Recipe[];
  orders: Order[];
  tickets: DepartmentTicket[];
  payments: PaymentTransaction[];
  cashSession: CashSession;
  hotelRooms: HotelRoom[];
  reservations: HotelReservation[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  cart: CartItem[];

  // Actions
  placeOrder: (
    tableNumber: string,
    cartItems: CartItem[],
    paymentMethod: 'mtn_momo' | 'airtel_money' | 'cash' | 'bank_card',
    customerName?: string,
    customerEmail?: string
  ) => Order;
  updateTicketStatus: (ticketId: string, status: DepartmentTicket['status'], assignedStaff?: string) => void;
  confirmDelivery: (orderId: string, serverName: string) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  verifyPayment: (paymentId: string, cashierName: string, notes?: string) => void;
  submitStockRequest: (
    department: 'kitchen' | 'bar',
    requestedBy: string,
    items: { itemId: string; itemName: string; requestedQty: number; unit: string }[],
    notes?: string
  ) => void;
  approveStockRequest: (
    requestId: string,
    approverName: string,
    itemsWithApproved: { itemId: string; approvedQty: number }[]
  ) => void;
  issueStock: (requestId: string, issuerName: string) => void;
  addStockItem: (item: Omit<StockItem, 'id'>) => void;
  submitApplication: (appData: Omit<BusinessApplication, 'id' | 'reference' | 'status' | 'submittedAt'>) => string;
  reviewApplication: (appId: string, decision: 'approved' | 'rejected', notes: string) => void;
  updateRoomHousekeeping: (roomId: string, status: HotelRoom['housekeepingStatus']) => void;
  checkInReservation: (resId: string) => void;
  checkOutReservation: (resId: string) => void;
  clockInShift: (empId: string, empName: string, department: string, role: Role) => void;
  clockOutShift: (empId: string) => void;
  closeCashSession: (actualCash: number, notes?: string) => void;
  toggleDepartmentStatus: (deptId: string) => void;
  addToCart: (item: MenuItem, quantity?: number, instructions?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  markNotificationRead: (id: string) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => MenuItem;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'lastUpdated'>) => Recipe;
  updateRecipe: (recipeId: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (recipeId: string) => void;
  evaluateMenuItemAvailability: (currentStockItems?: StockItem[]) => void;
  recordStockPurchase: (
    stockItemId: string,
    quantityAdded: number,
    supplier?: string,
    unitCost?: number,
    invoiceRef?: string
  ) => void;
}

const SangiraContext = createContext<SangiraContextType | undefined>(undefined);

export const SangiraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRoleOrPublic>('PUBLIC');
  const [allBusinesses, setAllBusinesses] = useState<Business[]>(initialBusinesses);
  const [activeBusiness, setActiveBusiness] = useState<Business>(initialBusinesses[0]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<string>('landing');

  // Better Auth & Server Integration State
  const [staffSession, setStaffSession] = useState<StaffSessionResponse>({
    authenticated: false,
    configured: false,
    user: null,
  });
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatusReport | null>(null);
  const [preKeyPreviewMode, setPreKeyPreviewMode] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [lastEmailAlert, setLastEmailAlert] = useState<{
    status: 'sent' | 'missing_key' | 'error';
    message: string;
  } | null>(null);

  const [applications, setApplications] = useState<BusinessApplication[]>(initialApplications);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [stockItems, setStockItems] = useState<StockItem[]>(initialStockItems);
  const [stockRequests, setStockRequests] = useState<StockRequest[]>(initialStockRequests);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(initialStockMovements);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sangira_menu_items');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // Fallback to initial
      }
    }
    return initialMenuItems;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sangira_menu_items', JSON.stringify(menuItems));
      } catch {
        // Ignore quota
      }
    }
  }, [menuItems]);

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sangira_recipes');
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return initialRecipes;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sangira_recipes', JSON.stringify(recipes));
      } catch {
        // Ignore quota
      }
    }
  }, [recipes]);

  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [tickets, setTickets] = useState<DepartmentTicket[]>(initialDepartmentTickets);
  const [payments, setPayments] = useState<PaymentTransaction[]>(initialPayments);
  const [hotelRooms, setHotelRooms] = useState<HotelRoom[]>(initialHotelRooms);
  const [reservations, setReservations] = useState<HotelReservation[]>(initialReservations);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [shifts, setShifts] = useState<StaffShift[]>([
    { id: 'sh-1', employeeId: 'EMP-08', employeeName: 'Samuel Rutayisire', department: 'Dining Room & Service', role: 'SERVER', clockIn: '08:00', status: 'active', verificationMethod: 'pin' },
    { id: 'sh-2', employeeId: 'EMP-02', employeeName: 'Eric Bizimana', department: 'Main Kitchen', role: 'KITCHEN_MANAGER', clockIn: '07:30', status: 'active', verificationMethod: 'pin' },
    { id: 'sh-3', employeeId: 'EMP-07', employeeName: 'Diane Ingabire', department: 'Cashier & Settlement', role: 'CASHIER', clockIn: '08:15', status: 'active', verificationMethod: 'pin' },
  ]);

  const [cashSession, setCashSession] = useState<CashSession>({
    id: 'cs-today',
    cashierId: 'emp-107',
    cashierName: 'Diane Ingabire',
    openedAt: '2026-11-06T08:15:00Z',
    openingBalance: 150000,
    cashReceived: 88500,
    cardTotal: 124000,
    digitalTotal: 246500,
    refundsTotal: 0,
    expectedCash: 238500,
    status: 'open',
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const addNotification = useCallback(
    (
      title: string,
      description: string,
      department: string,
      importance: Notification['importance'] = 'normal',
      customId?: string
    ) => {
      setNotifications((prev) => {
        if (customId && prev.some((n) => n.id === customId)) {
          return prev.map((n) =>
            n.id === customId ? { ...n, title, description, importance } : n
          );
        }
        const newNotif: Notification = {
          id: customId || `notif-${Date.now()}-${Math.floor(Math.random() * 100)}`,
          title,
          description,
          department,
          importance,
          isRead: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        return [newNotif, ...prev];
      });
    },
    []
  );

  const refreshIntegrationStatus = useCallback(async () => {
    try {
      const report = await sangiraApi.getIntegrationStatus();
      setIntegrationStatus(report);
      setDbConnected(report.databaseReachable);

      if (!report.services.resend.configured) {
        addNotification(
          'Resend Email Key Needed (RESEND_API_KEY)',
          'Business approvals, guest MoMo receipts, and staff shift emails are ready to send—add RESEND_API_KEY in AI Studio Secrets to enable live delivery.',
          'Email Delivery (Resend)',
          'urgent',
          'notif-missing-resend-key'
        );
        setLastEmailAlert((prev) =>
          prev || {
            status: 'missing_key',
            message:
              'Resend Email Notification: Add RESEND_API_KEY in AI Studio Secrets to activate automated React Email delivery.',
          }
        );
      }

      const dbAuthMissing = report.allMissingKeys.filter((k) => k !== 'RESEND_API_KEY');
      if (dbAuthMissing.length > 0) {
        addNotification(
          'Action Required: Add Database & Auth Keys in Secrets',
          `Add ${dbAuthMissing.join(' and ')} in AI Studio Secrets to connect Supabase PostgreSQL & Better Auth.`,
          'System Config',
          'urgent',
          'notif-missing-api-keys'
        );
      }
    } catch {
      setDbConnected(false);
    }
  }, [addNotification]);

  const refreshStaffSession = useCallback(async () => {
    try {
      const sessionRes = await sangiraApi.getStaffSession();
      setStaffSession(sessionRes);
      if (sessionRes.authenticated && sessionRes.user) {
        const userRole = (sessionRes.user.role as Role) || 'HOTEL_MANAGER';
        setRole(userRole);
        setPreKeyPreviewMode(false);
        const matchedBiz = allBusinesses.find((b) => b.id === sessionRes.user?.businessId);
        if (matchedBiz) {
          setActiveBusiness(matchedBiz);
        }
      }
    } catch {
      setStaffSession({ authenticated: false, configured: false, user: null });
    } finally {
      setIsAuthReady(true);
    }
  }, [allBusinesses]);

  useEffect(() => {
    refreshIntegrationStatus();
    refreshStaffSession();
  }, [refreshIntegrationStatus, refreshStaffSession]);

  const signInStaff = async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });
      if (result.error) {
        return {
          ok: false,
          error: result.error.message || 'Invalid email or password',
        };
      }
      await refreshStaffSession();
      setActiveTab('dashboard');
      setIsAuthModalOpen(false);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : 'Unable to sign in. Verify DATABASE_URL and BETTER_AUTH_SECRET are configured.',
      };
    }
  };

  const signUpStaff = async (input: SignUpStaffInput): Promise<{ ok: boolean; error?: string }> => {
    try {
      const payload = {
        name: input.name.trim(),
        email: input.email.trim(),
        password: input.password,
        role: input.role,
        business_id: input.businessId,
        department: input.department,
        phone: input.phone || '+250 788 000 000',
        employee_id: `EMP-${Math.floor(10 + Math.random() * 89)}`,
      };

      const result = await authClient.signUp.email(payload as Parameters<typeof authClient.signUp.email>[0]);
      if (result.error) {
        return {
          ok: false,
          error: result.error.message || 'Unable to register staff account',
        };
      }

      await refreshStaffSession();
      setRole(input.role);
      setActiveTab('dashboard');
      setIsAuthModalOpen(false);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : 'Registration failed. Ensure DATABASE_URL and BETTER_AUTH_SECRET are set.',
      };
    }
  };

  const logoutUser = async () => {
    try {
      await authClient.signOut();
    } catch {
      // Ignore if Better Auth is in pre-key mode
    }
    setStaffSession((prev) => ({ ...prev, authenticated: false, user: null }));
    setPreKeyPreviewMode(false);
    setRole('PUBLIC');
    setActiveTab('landing');
  };

  const sendTestEmail = async (recipientEmail: string): Promise<{ ok: boolean; message: string }> => {
    try {
      const res = await sangiraApi.sendTestEmail(
        recipientEmail,
        activeBusiness.name,
        staffSession.user?.name || 'Administrator'
      );
      if (res.emailResult.sent) {
        const msg = `Resend test email delivered to ${recipientEmail} (ID: ${res.emailResult.providerId || 'ok'}).`;
        setLastEmailAlert({ status: 'sent', message: msg });
        return { ok: true, message: msg };
      }
      const msg = res.emailResult.error || 'RESEND_API_KEY is missing. Add it in Secrets to send emails.';
      setLastEmailAlert({ status: 'missing_key', message: msg });
      return { ok: false, message: msg };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Test email request failed';
      setLastEmailAlert({ status: 'error', message: msg });
      return { ok: false, message: msg };
    }
  };

  const addAudit = (action: string, performedBy: string, userRole: string, dept: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      action,
      performedBy,
      role: userRole,
      department: dept,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleEmailOutcomeNotification = (
    contextLabel: string,
    recipient: string,
    outcome?: { sent: boolean; status: string; error?: string } | null
  ) => {
    if (!outcome) return;
    if (outcome.sent) {
      const msg = `${contextLabel} email delivered via Resend to ${recipient}.`;
      setLastEmailAlert({ status: 'sent', message: msg });
      addNotification(`${contextLabel} Email Sent`, msg, 'Email Delivery', 'normal');
    } else if (outcome.status === 'skipped_missing_key') {
      const msg = `${contextLabel} email skipped — add RESEND_API_KEY in Secrets to enable Resend delivery.`;
      setLastEmailAlert({ status: 'missing_key', message: msg });
      addNotification(
        'Resend API Key Missing',
        `${msg} Target recipient: ${recipient}.`,
        'System Config',
        'urgent',
        'notif-resend-key-missing'
      );
    } else if (outcome.error) {
      setLastEmailAlert({ status: 'error', message: outcome.error });
    }
  };

  // 1. PLACE CUSTOMER ORDER (With automatic Kitchen & Bar ticket split + Resend Order Receipt)
  const placeOrder = (
    tableNumber: string,
    cartItems: CartItem[],
    paymentMethod: 'mtn_momo' | 'airtel_money' | 'cash' | 'bank_card',
    customerName?: string,
    customerEmail?: string
  ): Order => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);
    const taxAmount = Math.round(subtotal * activeBusiness.taxRate);
    const totalAmount = subtotal + taxAmount;
    const orderNum = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrderId = `ord-${Date.now()}`;

    const newOrder: Order = {
      id: newOrderId,
      orderNumber: orderNum,
      tableNumber,
      businessId: activeBusiness.id,
      customerName: customerName || 'Dine-in Guest',
      customerEmail: customerEmail?.trim() || undefined,
      orderType: 'dine_in',
      items: cartItems.map((c) => ({
        menuItemId: c.menuItem.id,
        name: c.menuItem.name,
        department: c.menuItem.department,
        quantity: c.quantity,
        price: c.menuItem.price,
        specialInstructions: c.specialInstructions,
      })),
      subtotal,
      taxAmount,
      totalAmount,
      status: 'received',
      paymentStatus: 'pending',
      paymentMethod,
      createdAt: new Date().toISOString(),
    };

    const kitchenItems = cartItems.filter((c) => c.menuItem.department === 'kitchen');
    const barItems = cartItems.filter((c) => c.menuItem.department === 'bar');
    const generatedTickets: DepartmentTicket[] = [];

    if (kitchenItems.length > 0) {
      generatedTickets.push({
        id: `tkt-k-${Date.now()}`,
        orderId: newOrderId,
        orderNumber: orderNum,
        tableNumber,
        department: 'kitchen',
        items: kitchenItems.map((k) => ({
          name: k.menuItem.name,
          quantity: k.quantity,
          instructions: k.specialInstructions,
        })),
        status: 'new',
        priority: 'normal',
        createdAt: new Date().toISOString(),
      });
      addNotification(`New Kitchen Ticket (${orderNum})`, `${kitchenItems.length} food item(s) ordered for ${tableNumber}`, 'kitchen', 'high');
    }

    if (barItems.length > 0) {
      generatedTickets.push({
        id: `tkt-b-${Date.now() + 1}`,
        orderId: newOrderId,
        orderNumber: orderNum,
        tableNumber,
        department: 'bar',
        items: barItems.map((b) => ({
          name: b.menuItem.name,
          quantity: b.quantity,
          instructions: b.specialInstructions,
        })),
        status: 'new',
        priority: 'normal',
        createdAt: new Date().toISOString(),
      });
      addNotification(`New Bar Ticket (${orderNum})`, `${barItems.length} drink(s) ordered for ${tableNumber}`, 'bar', 'high');
    }

    const newPayment: PaymentTransaction = {
      id: `pay-${Date.now()}`,
      reference: `PAY-RW-${Math.floor(10000 + Math.random() * 90000)}`,
      orderId: newOrderId,
      orderNumber: orderNum,
      tableNumber,
      amount: totalAmount,
      method: paymentMethod,
      status: 'pending',
      providerRef: `${paymentMethod.toUpperCase()}-REQ-${Date.now().toString().slice(-6)}`,
      customerPhoneOrName: customerName || `${tableNumber} Guest`,
      customerEmail: customerEmail?.trim() || undefined,
      transactionTime: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setTickets((prev) => [...generatedTickets, ...prev]);
    setPayments((prev) => [newPayment, ...prev]);
    setCart([]);

    sangiraApi
      .placeOrder({
        order: newOrder,
        tickets: generatedTickets,
        payment: newPayment,
        businessName: activeBusiness.name,
        customerEmail: customerEmail?.trim() || undefined,
      })
      .then((res) => {
        if (customerEmail?.trim()) {
          handleEmailOutcomeNotification('Guest Order Receipt', customerEmail.trim(), res.emailResult);
        }
      })
      .catch(() => {
        // Keep local UI optimistic if offline/pre-key
      });

    addAudit('ORDER_PLACED', customerName || tableNumber, 'CUSTOMER', 'Service', `Created ${orderNum} totaling ${totalAmount.toLocaleString()} RWF with ${generatedTickets.length} department ticket(s).`);
    return newOrder;
  };

  // 2. KITCHEN & BAR TICKET STATUS PROGRESSION
  const updateTicketStatus = (ticketId: string, status: DepartmentTicket['status'], assignedStaff?: string) => {
    let orderIdToInspect = '';
    let readyNow = false;

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          orderIdToInspect = t.orderId;
          if (status === 'ready') readyNow = true;
          return {
            ...t,
            status,
            assignedStaff: assignedStaff || t.assignedStaff,
            readyAt: status === 'ready' ? new Date().toISOString() : t.readyAt,
          };
        }
        return t;
      })
    );

    if (readyNow) {
      addNotification('Order Ready for Pickup', `Ticket ${ticketId} has been marked ready. Available for server delivery.`, 'service', 'urgent');
    }

    if (orderIdToInspect) {
      setTimeout(() => {
        setTickets((currentTickets) => {
          const related = currentTickets.filter((t) => t.orderId === orderIdToInspect);
          const allReadyOrReleased = related.every((t) => t.status === 'ready' || t.status === 'released_to_service');
          const anyPreparing = related.some((t) => t.status === 'preparing');

          setOrders((curOrders) =>
            curOrders.map((ord) => {
              if (ord.id === orderIdToInspect) {
                let updatedStatus = ord.status;
                if (allReadyOrReleased) updatedStatus = 'ready';
                else if (anyPreparing) updatedStatus = 'preparing';
                return { ...ord, status: updatedStatus };
              }
              return ord;
            })
          );
          return currentTickets;
        });
      }, 50);
    }

    addAudit('TICKET_STATUS_UPDATED', assignedStaff || 'Staff', 'DEPARTMENT_CREW', 'Production', `Ticket ${ticketId} marked as ${status}`);
  };

  // RECIPE AVAILABILITY ENGINE
  const evaluateMenuItemAvailability = (currentStockItems?: StockItem[]) => {
    const itemsToCheck = currentStockItems || stockItems;
    setMenuItems((prev) =>
      prev.map((item) => {
        const recipe = recipes.find(
          (r) => r.menuItemId === item.id || r.id === item.recipeId || r.menuItemName.toLowerCase() === item.name.toLowerCase()
        );
        if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
          return item;
        }

        let isAvailable = true;
        let depletedIngredient = '';

        for (const ing of recipe.ingredients) {
          const stock = itemsToCheck.find((s) => s.id === ing.stockItemId);
          if (!stock) {
            isAvailable = false;
            depletedIngredient = ing.stockItemName;
            break;
          }
          const availableStock = recipe.department === 'bar' ? stock.barStock : stock.kitchenStock;
          if (availableStock < ing.quantity) {
            isAvailable = false;
            depletedIngredient = ing.stockItemName;
            break;
          }
        }

        if (item.isAvailable !== isAvailable) {
          if (!isAvailable) {
            addNotification(
              'Dish Sold Out (Auto Stockout)',
              `${item.name} automatically disabled on customer menu due to depleted ${depletedIngredient}.`,
              item.department
            );
          } else {
            addNotification(
              'Dish Back In Stock',
              `${item.name} has been restored to active menu availability.`,
              item.department
            );
          }
        }

        return { ...item, isAvailable };
      })
    );
  };

  const addRecipe = (recipeData: Omit<Recipe, 'id' | 'lastUpdated'>): Recipe => {
    const newRec: Recipe = {
      ...recipeData,
      id: `rec-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setRecipes((prev) => [newRec, ...prev]);
    setMenuItems((prev) =>
      prev.map((m) => (m.id === recipeData.menuItemId ? { ...m, recipeId: newRec.id } : m))
    );
    addAudit('RECIPE_CREATED', 'Kitchen/Bar Manager', 'KITCHEN_MANAGER', 'Recipes', `Created recipe for ${recipeData.menuItemName}`);
    addNotification('Recipe Created', `New recipe specification created for ${recipeData.menuItemName}`, recipeData.department);
    return newRec;
  };

  const updateRecipe = (recipeId: string, updates: Partial<Recipe>) => {
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === recipeId
          ? { ...r, ...updates, lastUpdated: new Date().toISOString().split('T')[0] }
          : r
      )
    );
    addAudit('RECIPE_UPDATED', 'Kitchen/Bar Manager', 'KITCHEN_MANAGER', 'Recipes', `Updated recipe ${recipeId}`);
  };

  const deleteRecipe = (recipeId: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    setMenuItems((prev) =>
      prev.map((m) => (m.recipeId === recipeId ? { ...m, recipeId: undefined } : m))
    );
    addAudit('RECIPE_DELETED', 'Kitchen/Bar Manager', 'KITCHEN_MANAGER', 'Recipes', `Deleted recipe ${recipeId}`);
  };

  // 3. SERVER DELIVERY CONFIRMATION (Atomic SQL transaction on backend + local sync)
  const confirmDelivery = (orderId: string, serverName: string) => {
    const targetOrder = orders.find((ord) => ord.id === orderId);

    setOrders((prev) => prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'delivered' } : ord)));
    setTickets((prev) => prev.map((t) => (t.orderId === orderId ? { ...t, status: 'released_to_service' } : t)));

    sangiraApi
      .deliverOrder(orderId, {
        businessId: activeBusiness.id,
        serverName,
      })
      .catch(() => {});

    if (targetOrder && targetOrder.items.length > 0) {
      const ingredientDeductions: {
        [stockItemId: string]: {
          stockItemId: string;
          stockItemName: string;
          quantity: number;
          unit: string;
          department: 'kitchen' | 'bar';
        };
      } = {};

      targetOrder.items.forEach((item) => {
        const recipe = recipes.find(
          (r) => r.menuItemId === item.menuItemId || r.menuItemName.toLowerCase() === item.name.toLowerCase()
        );
        if (recipe && recipe.ingredients) {
          recipe.ingredients.forEach((ing) => {
            const consumedQty = Math.round(ing.quantity * item.quantity * 1000) / 1000;
            if (!ingredientDeductions[ing.stockItemId]) {
              ingredientDeductions[ing.stockItemId] = {
                stockItemId: ing.stockItemId,
                stockItemName: ing.stockItemName,
                quantity: consumedQty,
                unit: ing.unit,
                department: recipe.department,
              };
            } else {
              ingredientDeductions[ing.stockItemId].quantity =
                Math.round((ingredientDeductions[ing.stockItemId].quantity + consumedQty) * 1000) / 1000;
            }
          });
        }
      });

      const newMovements: StockMovement[] = [];

      setStockItems((prevItems) => {
        const updated = prevItems.map((stk) => {
          const deduction = ingredientDeductions[stk.id];
          if (!deduction) return stk;

          const consumedAmount = deduction.quantity;
          let newKitchenStock = stk.kitchenStock;
          let newBarStock = stk.barStock;

          if (deduction.department === 'bar') {
            newBarStock = Math.max(0, Math.round((newBarStock - consumedAmount) * 1000) / 1000);
          } else {
            newKitchenStock = Math.max(0, Math.round((newKitchenStock - consumedAmount) * 1000) / 1000);
          }

          const newCentralStock = Math.max(0, Math.round((stk.centralStock - consumedAmount) * 1000) / 1000);

          newMovements.push({
            id: `mov-${Date.now()}-${stk.id}`,
            reference: `MOV-CONS-${Date.now().toString().slice(-5)}`,
            productId: stk.id,
            productName: stk.name,
            type: 'consumption',
            quantity: consumedAmount,
            unit: stk.unit,
            source: deduction.department === 'bar' ? 'Terrace Bar Line' : 'Main Kitchen Prep',
            destination: `Guest Service (${targetOrder.tableNumber})`,
            employeeName: serverName,
            timestamp: new Date().toISOString(),
            reason: `Recipe consumption: Plated & served Order #${targetOrder.orderNumber} (${targetOrder.tableNumber})`,
          });

          return {
            ...stk,
            kitchenStock: newKitchenStock,
            barStock: newBarStock,
            centralStock: newCentralStock,
          };
        });

        setTimeout(() => {
          evaluateMenuItemAvailability(updated);
        }, 50);

        return updated;
      });

      if (newMovements.length > 0) {
        setStockMovements((prev) => [...newMovements, ...prev]);
        addNotification(
          'Ingredient Stock Deducted',
          `Order #${targetOrder.orderNumber} delivered: ${newMovements.length} raw ingredients automatically deducted for ${targetOrder.tableNumber}.`,
          'inventory'
        );
      }
    }

    addAudit('ORDER_DELIVERED', serverName, 'SERVER', 'Service Floor', `Order ${orderId} delivered to guest table with automated recipe stock deduction.`);
    addNotification('Order Delivered', `Order ${orderId} marked delivered by ${serverName}`, 'service');
  };

  // 3b. CANCEL ORDER
  const cancelOrder = (orderId: string, reason?: string) => {
    let cancelledOrderNum = '';
    let tableNum = '';

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          cancelledOrderNum = ord.orderNumber;
          tableNum = ord.tableNumber;
          return {
            ...ord,
            status: 'cancelled' as const,
            paymentStatus: ord.paymentStatus === 'verified' ? ('refunded' as const) : ('failed' as const),
          };
        }
        return ord;
      })
    );

    setTickets((prev) => prev.filter((t) => t.orderId !== orderId));
    setPayments((prev) =>
      prev.map((p) =>
        p.orderId === orderId
          ? {
              ...p,
              status: 'failed' as const,
              notes: `Order cancelled: ${reason || 'Customer emergency exit from hotel'}`,
            }
          : p
      )
    );

    addNotification(
      'Order Cancelled by Guest',
      `Order ${cancelledOrderNum || orderId} for ${tableNum || 'Guest Table'} was cancelled (${reason || 'Guest emergency exit'}). Kitchen & Bar lines halted.`,
      'kitchen',
      'urgent'
    );
    addAudit(
      'ORDER_CANCELLED',
      'Guest Customer',
      'CUSTOMER',
      'Service Floor',
      `Order ${cancelledOrderNum || orderId} cancelled: ${reason || 'Immediate exit'}`
    );
  };

  // 4. CASHIER PAYMENT VERIFICATION + RESEND VERIFIED RECEIPT EMAIL
  const verifyPayment = (paymentId: string, cashierName: string, notes?: string) => {
    const targetPay = payments.find((p) => p.id === paymentId);
    const targetOrder = targetPay ? orders.find((o) => o.id === targetPay.orderId) : undefined;

    let orderIdToUpdate = '';
    let verifiedAmount = 0;
    let payMethod: PaymentTransaction['method'] = 'cash';

    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === paymentId) {
          orderIdToUpdate = p.orderId;
          verifiedAmount = p.amount;
          payMethod = p.method;
          return {
            ...p,
            status: 'verified',
            verifiedBy: cashierName,
            notes: notes || 'Verified by authorized cashier.',
          };
        }
        return p;
      })
    );

    if (orderIdToUpdate) {
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderIdToUpdate ? { ...ord, paymentStatus: 'verified' } : ord))
      );
    }

    setCashSession((prev) => {
      let cashRec = prev.cashReceived;
      let cardRec = prev.cardTotal;
      let digRec = prev.digitalTotal;

      if (payMethod === 'cash') cashRec += verifiedAmount;
      else if (payMethod === 'bank_card') cardRec += verifiedAmount;
      else digRec += verifiedAmount;

      return {
        ...prev,
        cashReceived: cashRec,
        cardTotal: cardRec,
        digitalTotal: digRec,
        expectedCash: prev.openingBalance + cashRec,
      };
    });

    const recipientEmail = targetPay?.customerEmail || targetOrder?.customerEmail;
    sangiraApi
      .verifyPayment(paymentId, {
        cashierName,
        notes: notes || 'Verified by authorized cashier.',
        businessId: activeBusiness.id,
        businessName: activeBusiness.name,
        customerEmail: recipientEmail,
        orderNumber: targetPay?.orderNumber,
        tableNumber: targetPay?.tableNumber,
        customerName: targetOrder?.customerName || targetPay?.customerPhoneOrName,
        paymentMethod: targetPay?.method,
        paymentReference: targetPay?.reference,
        items: targetOrder?.items || [],
        subtotal: targetOrder?.subtotal || targetPay?.amount || 0,
        taxAmount: targetOrder?.taxAmount || 0,
        totalAmount: targetOrder?.totalAmount || targetPay?.amount || 0,
      })
      .then((res) => {
        if (recipientEmail) {
          handleEmailOutcomeNotification('MoMo / Settlement Receipt', recipientEmail, res.emailResult);
        }
      })
      .catch(() => {});

    addAudit('PAYMENT_VERIFIED', cashierName, 'CASHIER', 'Finance', `Verified payment ${paymentId} of ${verifiedAmount.toLocaleString()} RWF via ${payMethod.toUpperCase()}`);
    addNotification('Payment Confirmed', `Payment of ${verifiedAmount.toLocaleString()} RWF verified by ${cashierName}`, 'cashier');
  };

  // 5. STOCK REQUISITIONS & ISSUING
  const submitStockRequest = (
    department: 'kitchen' | 'bar',
    requestedBy: string,
    items: { itemId: string; itemName: string; requestedQty: number; unit: string }[],
    notes?: string
  ) => {
    const newReq: StockRequest = {
      id: `req-${Date.now()}`,
      reference: `REQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      department,
      requestedBy,
      requestedAt: new Date().toISOString(),
      items: items.map((i) => ({ ...i, approvedQty: i.requestedQty, issuedQty: 0 })),
      status: 'pending',
      notes,
    };

    setStockRequests((prev) => [newReq, ...prev]);
    addNotification(`New Stock Request (${department.toUpperCase()})`, `${items.length} item(s) requested by ${requestedBy}`, 'stock', 'urgent');
    addAudit('STOCK_REQUESTED', requestedBy, department === 'kitchen' ? 'KITCHEN_MANAGER' : 'BAR_MANAGER', department, `Submitted ${newReq.reference} for ${items.length} supply items.`);
  };

  const approveStockRequest = (
    requestId: string,
    approverName: string,
    itemsWithApproved: { itemId: string; approvedQty: number }[]
  ) => {
    setStockRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const updatedItems = req.items.map((it) => {
            const found = itemsWithApproved.find((a) => a.itemId === it.itemId);
            return found ? { ...it, approvedQty: found.approvedQty } : it;
          });
          return {
            ...req,
            items: updatedItems,
            status: 'approved',
            approvedBy: approverName,
            approvedAt: new Date().toISOString(),
          };
        }
        return req;
      })
    );

    addAudit('STOCK_REQUEST_APPROVED', approverName, 'STOCK_MANAGER', 'Inventory', `Approved requisition ${requestId}`);
    addNotification('Stock Request Approved', `Requisition ${requestId} approved by ${approverName}. Ready for warehouse issuing.`, 'stock');
  };

  const issueStock = (requestId: string, issuerName: string) => {
    const targetReq = stockRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    const newMovements: StockMovement[] = [];

    setStockItems((prevItems) => {
      const updated = [...prevItems];
      targetReq.items.forEach((reqItem) => {
        const qtyToIssue = reqItem.approvedQty ?? reqItem.requestedQty;
        const itemIdx = updated.findIndex((i) => i.id === reqItem.itemId);
        if (itemIdx >= 0) {
          const it = updated[itemIdx];
          const newCentral = Math.max(0, it.centralStock - qtyToIssue);
          let newKit = it.kitchenStock;
          let newBar = it.barStock;

          if (targetReq.department === 'kitchen') newKit += qtyToIssue;
          else newBar += qtyToIssue;

          updated[itemIdx] = {
            ...it,
            centralStock: newCentral,
            kitchenStock: newKit,
            barStock: newBar,
          };

          newMovements.push({
            id: `mov-${Date.now()}-${it.id}`,
            reference: `MOV-${Date.now().toString().slice(-6)}`,
            productId: it.id,
            productName: it.name,
            type: 'department_issuance',
            quantity: qtyToIssue,
            unit: it.unit,
            source: 'Central Warehouse',
            destination: targetReq.department === 'kitchen' ? 'Main Kitchen' : 'Bar & Lounge',
            employeeName: issuerName,
            timestamp: new Date().toISOString(),
            reason: `Requisition ${targetReq.reference} issued.`,
          });
        }
      });
      setTimeout(() => {
        evaluateMenuItemAvailability(updated);
      }, 50);
      return updated;
    });

    setStockMovements((prev) => [...newMovements, ...prev]);
    setStockRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'issued',
              issuedAt: new Date().toISOString(),
              items: r.items.map((it) => ({ ...it, issuedQty: it.approvedQty ?? it.requestedQty })),
            }
          : r
      )
    );

    addAudit('STOCK_ISSUED', issuerName, 'STOCK_MANAGER', 'Inventory', `Issued requisition ${targetReq.reference} to ${targetReq.department}`);
    addNotification('Stock Requisition Fulfilled', `${targetReq.department.toUpperCase()} requisition ${targetReq.reference} issued. Goods transferred to department line.`, targetReq.department);
  };

  const addStockItem = (itemData: Omit<StockItem, 'id'>) => {
    const newItem: StockItem = {
      ...itemData,
      id: `stk-${Date.now()}`,
    };
    setStockItems((prev) => [newItem, ...prev]);

    const newMov: StockMovement = {
      id: `mov-${Date.now()}`,
      reference: `MOV-${Date.now().toString().slice(-6)}`,
      productId: newItem.id,
      productName: newItem.name,
      type: 'purchase_receipt',
      quantity: newItem.centralStock,
      unit: newItem.unit,
      source: newItem.supplier || 'Initial Supplier',
      destination: newItem.storageLocation || 'Central Warehouse',
      employeeName: 'Stock Manager',
      timestamp: new Date().toISOString(),
      reason: 'New product line registered and received.',
    };
    setStockMovements((prev) => [newMov, ...prev]);
    addAudit('PRODUCT_ADDED', 'Stock Manager', 'STOCK_MANAGER', 'Inventory', `Registered product SKU ${newItem.sku} (${newItem.name})`);
  };

  const recordStockPurchase = (
    stockItemId: string,
    quantityAdded: number,
    supplier?: string,
    unitCost?: number,
    invoiceRef?: string
  ) => {
    let affectedItemName = '';
    let affectedUnit = 'kg';

    setStockItems((prevItems) => {
      const updated = prevItems.map((item) => {
        if (item.id === stockItemId) {
          affectedItemName = item.name;
          affectedUnit = item.unit;
          const newCentral = item.centralStock + quantityAdded;
          const newCost = unitCost && unitCost > 0 ? unitCost : item.costPerUnit;
          return {
            ...item,
            centralStock: newCentral,
            costPerUnit: newCost,
            supplier: supplier || item.supplier,
          };
        }
        return item;
      });

      setTimeout(() => {
        evaluateMenuItemAvailability(updated);
      }, 50);

      return updated;
    });

    const newMov: StockMovement = {
      id: `mov-${Date.now()}`,
      reference: `PUR-${invoiceRef || Date.now().toString().slice(-6)}`,
      productId: stockItemId,
      productName: affectedItemName || 'Ingredient',
      type: 'purchase_receipt',
      quantity: quantityAdded,
      unit: affectedUnit,
      source: supplier || 'Supplier Invoice',
      destination: 'Central Storage & Line Stations',
      employeeName: 'Admin / Inventory Manager',
      timestamp: new Date().toISOString(),
      reason: `Stock replenishment invoice #${invoiceRef || 'INV-2026-REPLENISH'} received`,
    };
    setStockMovements((prev) => [newMov, ...prev]);

    addAudit(
      'STOCK_PURCHASE_RECORDED',
      'Manager',
      'HOTEL_MANAGER',
      'Inventory',
      `Recorded purchase replenishment of ${quantityAdded} ${affectedUnit} of ${affectedItemName || stockItemId}`
    );
    addNotification(
      'Stock Restocked',
      `Received ${quantityAdded} ${affectedUnit} of ${affectedItemName || 'ingredient'}. Menu dishes evaluated.`,
      'inventory'
    );
  };

  // 6. BUSINESS ONBOARDING & APPLICATION WORKFLOW + RESEND APPROVAL/REJECTION EMAILS
  const submitApplication = (appData: Omit<BusinessApplication, 'id' | 'reference' | 'status' | 'submittedAt'>): string => {
    const ref = `SNG-APP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newApp: BusinessApplication = {
      ...appData,
      id: `app-${Date.now()}`,
      reference: ref,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setApplications((prev) => [newApp, ...prev]);

    sangiraApi.submitApplication(newApp as unknown as Record<string, unknown>).catch(() => {});

    addAudit('APPLICATION_SUBMITTED', appData.ownerName, 'PROSPECTIVE_OWNER', 'Onboarding', `Submitted application for ${appData.businessName} (Ref: ${ref})`);
    addNotification('New Business Application', `${appData.businessName} (${appData.businessType}) submitted registration documents.`, 'management', 'high');
    return ref;
  };

  const reviewApplication = (appId: string, decision: 'approved' | 'rejected', notes: string) => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;

    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: decision, reviewerNotes: notes } : a))
    );

    if (decision === 'approved') {
      const newBizId = `biz-${app.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const newBiz: Business = {
        id: newBizId,
        name: app.businessName,
        type: app.businessType,
        status: 'active',
        location: app.location,
        phone: app.phone,
        email: app.email,
        currency: 'RWF',
        taxRate: 0.18,
        hasHotelModule: app.businessType === 'hotel',
        tableCount: 12,
        createdAt: new Date().toISOString(),
      };
      setAllBusinesses((prev) => (prev.some((b) => b.id === newBiz.id) ? prev : [...prev, newBiz]));
      addAudit('BUSINESS_APPROVED', 'System Administrator', 'SYSTEM_ADMIN', 'Platform', `Approved tenant application ${app.reference}. Created workspace for ${app.businessName}.`);
      addNotification('Business Approved', `Workspace activated for ${app.businessName}. Approval email queued for ${app.email}`, 'management');
    } else {
      addAudit('BUSINESS_REJECTED', 'System Administrator', 'SYSTEM_ADMIN', 'Platform', `Rejected application ${app.reference}. Reason: ${notes}`);
    }

    sangiraApi
      .reviewApplication(appId, {
        decision,
        notes,
        applicantEmail: app.email,
        businessName: app.businessName,
        ownerName: app.ownerName,
        reference: app.reference,
        businessType: app.businessType,
        location: app.location,
        phone: app.phone,
      })
      .then((res) => {
        handleEmailOutcomeNotification(
          decision === 'approved' ? 'Business Approval' : 'Business Rejection',
          app.email,
          res.emailResult
        );
      })
      .catch(() => {});
  };

  // 7. HOTEL MANAGEMENT
  const updateRoomHousekeeping = (roomId: string, status: HotelRoom['housekeepingStatus']) => {
    setHotelRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          let roomStatus = r.status;
          if (status === 'clean' || status === 'inspected') {
            roomStatus = r.guestName ? 'occupied' : 'available';
          } else {
            roomStatus = 'cleaning';
          }
          return { ...r, housekeepingStatus: status, status: roomStatus };
        }
        return r;
      })
    );
    addAudit('HOUSEKEEPING_UPDATE', 'Housekeeping Supervisor', 'HOTEL_MANAGER', 'Accommodations', `Room ${roomId} status changed to ${status}`);
  };

  const checkInReservation = (resId: string) => {
    const res = reservations.find((r) => r.id === resId);
    if (!res) return;

    setReservations((prev) => prev.map((r) => (r.id === resId ? { ...r, status: 'checked_in' } : r)));
    setHotelRooms((prev) =>
      prev.map((rm) => (rm.roomNumber === res.roomNumber ? { ...rm, status: 'occupied', guestName: res.guestName } : rm))
    );
    addAudit('HOTEL_CHECK_IN', 'Front Desk', 'HOTEL_MANAGER', 'Accommodations', `Checked in ${res.guestName} to Room ${res.roomNumber}`);
    addNotification('Guest Checked In', `${res.guestName} checked in to Room ${res.roomNumber}`, 'management');
  };

  const checkOutReservation = (resId: string) => {
    const res = reservations.find((r) => r.id === resId);
    if (!res) return;

    setReservations((prev) => prev.map((r) => (r.id === resId ? { ...r, status: 'checked_out' } : r)));
    setHotelRooms((prev) =>
      prev.map((rm) =>
        rm.roomNumber === res.roomNumber
          ? { ...rm, status: 'cleaning', housekeepingStatus: 'needs_cleaning', guestName: undefined }
          : rm
      )
    );
    addAudit('HOTEL_CHECK_OUT', 'Front Desk', 'HOTEL_MANAGER', 'Accommodations', `Checked out ${res.guestName} from Room ${res.roomNumber}.`);
    addNotification('Room Needs Cleaning', `Room ${res.roomNumber} vacated by ${res.guestName}. Housekeeping scheduled.`, 'management');
  };

  // 8. STAFF & ATTENDANCE + RESEND SHIFT NOTIFICATIONS
  const clockInShift = (empId: string, empName: string, department: string, shiftRole: Role) => {
    const emp = employees.find((e) => e.id === empId || e.employeeId === empId);
    const clockInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newShift: StaffShift = {
      id: `sh-${Date.now()}`,
      employeeId: empId,
      employeeName: empName,
      department,
      role: shiftRole,
      clockIn: clockInTime,
      status: 'active',
      verificationMethod: 'pin',
    };
    setShifts((prev) => [newShift, ...prev]);
    setEmployees((prev) =>
      prev.map((e) => (e.id === empId || e.employeeId === empId ? { ...e, shiftStatus: 'on_duty' } : e))
    );

    const empEmail = emp?.email || staffSession.user?.email;
    sangiraApi
      .recordStaffShift({
        eventType: 'clock_in',
        employeeId: empId,
        employeeName: empName,
        employeeEmail: empEmail,
        department,
        role: shiftRole,
        businessId: activeBusiness.id,
        businessName: activeBusiness.name,
        timestamp: clockInTime,
      })
      .then((res) => {
        if (empEmail) {
          handleEmailOutcomeNotification('Staff Clock-In', empEmail, res.emailResult);
        }
      })
      .catch(() => {});

    addAudit('STAFF_CLOCK_IN', empName, shiftRole, department, `Staff clock-in recorded.`);
  };

  const clockOutShift = (empId: string) => {
    const emp = employees.find((e) => e.id === empId || e.employeeId === empId);
    const clockOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setShifts((prev) =>
      prev.map((s) =>
        s.employeeId === empId && s.status === 'active'
          ? { ...s, clockOut: clockOutTime, status: 'completed' }
          : s
      )
    );
    setEmployees((prev) =>
      prev.map((e) => (e.id === empId || e.employeeId === empId ? { ...e, shiftStatus: 'off_duty' } : e))
    );

    const empEmail = emp?.email || staffSession.user?.email;
    sangiraApi
      .recordStaffShift({
        eventType: 'clock_out',
        employeeId: empId,
        employeeName: emp?.fullName || staffSession.user?.name || empId,
        employeeEmail: empEmail,
        department: emp?.department || 'Operations',
        role: emp?.roles[0] || 'SERVER',
        businessId: activeBusiness.id,
        businessName: activeBusiness.name,
        timestamp: clockOutTime,
      })
      .then((res) => {
        if (empEmail) {
          handleEmailOutcomeNotification('Staff Clock-Out', empEmail, res.emailResult);
        }
      })
      .catch(() => {});

    addAudit('STAFF_CLOCK_OUT', emp?.fullName || empId, 'STAFF', 'Operations', `Staff shift ended and clocked out.`);
  };

  // 9. CASH SESSION CLOSING
  const closeCashSession = (actualCash: number, notes?: string) => {
    const variance = actualCash - cashSession.expectedCash;
    setCashSession((prev) => ({
      ...prev,
      actualCash,
      difference: variance,
      status: 'closed',
      closedAt: new Date().toISOString(),
      notes,
    }));
    addAudit('CASH_SESSION_CLOSED', cashSession.cashierName, 'CASHIER', 'Finance', `Shift register closed. Variance: ${variance.toLocaleString()} RWF.`);
    addNotification('Daily Shift Closed', `Register closed by ${cashSession.cashierName}. Variance: ${variance >= 0 ? '+' : ''}${variance.toLocaleString()} RWF`, 'management', Math.abs(variance) > 5000 ? 'urgent' : 'normal');
  };

  const toggleDepartmentStatus = (deptId: string) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === deptId ? { ...d, isActive: !d.isActive } : d))
    );
  };

  // 11. CART HELPERS
  const addToCart = (item: MenuItem, quantity: number = 1, instructions?: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id
            ? { ...c, quantity: c.quantity + quantity, specialInstructions: instructions || c.specialInstructions }
            : c
        );
      }
      return [...prev, { menuItem: item, quantity, specialInstructions: instructions }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.menuItem.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.menuItem.id === itemId) {
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => setCart([]);

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const addMenuItem = (item: Omit<MenuItem, 'id'>): MenuItem => {
    const newItem: MenuItem = { ...item, id: `menu-${Date.now()}` };
    setMenuItems((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearLastEmailAlert = () => setLastEmailAlert(null);

  const contextValue = useMemo(
    () => ({
      role,
      setRole,
      activeBusiness,
      setActiveBusiness,
      allBusinesses,
      theme,
      toggleTheme,
      activeTab,
      setActiveTab,
      staffSession,
      currentStaffUser: staffSession.user,
      isAuthReady,
      dbConnected,
      integrationStatus,
      preKeyPreviewMode,
      setPreKeyPreviewMode,
      isAuthModalOpen,
      setIsAuthModalOpen,
      lastEmailAlert,
      clearLastEmailAlert,
      refreshIntegrationStatus,
      refreshStaffSession,
      signInStaff,
      signUpStaff,
      logoutUser,
      sendTestEmail,
      applications,
      departments,
      employees,
      shifts,
      stockItems,
      stockRequests,
      stockMovements,
      menuItems,
      recipes,
      orders,
      tickets,
      payments,
      cashSession,
      hotelRooms,
      reservations,
      notifications,
      auditLogs,
      cart,
      placeOrder,
      updateTicketStatus,
      confirmDelivery,
      cancelOrder,
      verifyPayment,
      submitStockRequest,
      approveStockRequest,
      issueStock,
      addStockItem,
      submitApplication,
      reviewApplication,
      updateRoomHousekeeping,
      checkInReservation,
      checkOutReservation,
      clockInShift,
      clockOutShift,
      closeCashSession,
      toggleDepartmentStatus,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      markNotificationRead,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      evaluateMenuItemAvailability,
      recordStockPurchase,
    }),
    [
      role,
      activeBusiness,
      allBusinesses,
      theme,
      activeTab,
      staffSession,
      isAuthReady,
      dbConnected,
      integrationStatus,
      preKeyPreviewMode,
      isAuthModalOpen,
      lastEmailAlert,
      refreshIntegrationStatus,
      refreshStaffSession,
      applications,
      departments,
      employees,
      shifts,
      stockItems,
      stockRequests,
      stockMovements,
      menuItems,
      recipes,
      orders,
      tickets,
      payments,
      cashSession,
      hotelRooms,
      reservations,
      notifications,
      auditLogs,
      cart,
    ]
  );

  return <SangiraContext.Provider value={contextValue}>{children}</SangiraContext.Provider>;
};

export const useSangira = () => {
  const context = useContext(SangiraContext);
  if (!context) throw new Error('useSangira must be used within SangiraProvider');
  return context;
};
