export type Role =
  | 'SYSTEM_ADMIN'
  | 'HOTEL_MANAGER'
  | 'KITCHEN_MANAGER'
  | 'KITCHEN_STAFF'
  | 'BAR_MANAGER'
  | 'BARTENDER'
  | 'STOCK_MANAGER'
  | 'CASHIER'
  | 'SERVER'
  | 'CUSTOMER';

export type BusinessType = 'hotel' | 'restaurant' | 'bar' | 'lounge';

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  status: 'active' | 'suspended' | 'pending';
  location: string;
  phone: string;
  email: string;
  currency: string;
  taxRate: number;
  logoUrl?: string;
  hasHotelModule: boolean;
  tableCount: number;
  createdAt: string;
  coverImage?: string;
  rating?: number;
  reviewCount?: number;
  priceRange?: string;
  description?: string;
  amenities?: string[];
  featuredDishes?: string[];
  roomStartingPrice?: number;
  city?: string;
}

export interface BusinessApplication {
  id: string;
  reference: string;
  businessName: string;
  businessType: BusinessType;
  location: string;
  description: string;
  ownerName: string;
  email: string;
  phone: string;
  position: string;
  documents: {
    businessRegistration: string;
    taxCertificate: string;
    identityDocument: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewerNotes?: string;
}

export interface Department {
  id: string;
  code: 'management' | 'kitchen' | 'bar' | 'stock' | 'cashier' | 'service' | 'front_desk' | 'housekeeping';
  name: string;
  description: string;
  isActive: boolean;
  staffCount: number;
  managerName: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  roles: Role[];
  employmentStatus: 'active' | 'on_leave' | 'inactive';
  shiftStatus: 'on_duty' | 'off_duty' | 'break';
  lastActivity: string;
  invitedAt: string;
}

export interface StaffShift {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  role: Role;
  clockIn: string;
  clockOut?: string;
  status: 'active' | 'completed';
  durationHours?: number;
  verificationMethod: 'pin' | 'biometric' | 'manager_override';
  managerAdjustmentReason?: string;
}

export interface StockItem {
  id: string;
  sku: string;
  name: string;
  category: 'produce' | 'dairy' | 'meat' | 'beverage' | 'dry_goods' | 'bar_supplies';
  unit: string;
  centralStock: number;
  kitchenStock: number;
  barStock: number;
  minThreshold: number;
  costPerUnit: number;
  supplier: string;
  expiryDate: string;
  batchNumber: string;
  storageLocation: string;
}

export interface StockRequestItem {
  itemId: string;
  itemName: string;
  requestedQty: number;
  approvedQty?: number;
  issuedQty?: number;
  unit: string;
}

export interface StockRequest {
  id: string;
  reference: string;
  department: 'kitchen' | 'bar';
  requestedBy: string;
  requestedAt: string;
  items: StockRequestItem[];
  status: 'pending' | 'approved' | 'partially_approved' | 'rejected' | 'issued';
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  issuedAt?: string;
}

export interface StockMovement {
  id: string;
  reference: string;
  productId: string;
  productName: string;
  type:
    | 'purchase_receipt'
    | 'department_issuance'
    | 'department_transfer'
    | 'consumption'
    | 'wastage'
    | 'damaged'
    | 'adjustment'
    | 'reversal';
  quantity: number;
  unit: string;
  source: string;
  destination: string;
  employeeName: string;
  timestamp: string;
  reason?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'appetizer' | 'main' | 'beverage' | 'cocktail' | 'wine' | 'dessert';
  department: 'kitchen' | 'bar';
  description: string;
  price: number;
  isAvailable: boolean;
  prepTimeMinutes: number;
  recipeId?: string;
  dietary?: string[];
  imageUrl?: string;
}

export interface Recipe {
  id: string;
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
  lastUpdated: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  department: 'kitchen' | 'bar';
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string;
  businessId: string;
  customerName?: string;
  customerEmail?: string;
  orderType: 'dine_in' | 'takeaway' | 'room_service';
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status:
    | 'received'
    | 'kitchen_processing'
    | 'bar_processing'
    | 'preparing'
    | 'partially_ready'
    | 'ready'
    | 'assigned_to_server'
    | 'delivered'
    | 'cancelled';
  paymentStatus: 'pending' | 'verified' | 'failed' | 'refunded';
  paymentMethod?: 'mtn_momo' | 'airtel_money' | 'cash' | 'bank_card';
  serverId?: string;
  serverName?: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface DepartmentTicket {
  id: string;
  orderId: string;
  orderNumber: string;
  tableNumber: string;
  department: 'kitchen' | 'bar';
  items: {
    name: string;
    quantity: number;
    instructions?: string;
  }[];
  status: 'new' | 'accepted' | 'assigned' | 'preparing' | 'ready' | 'released_to_service';
  assignedStaff?: string;
  priority: 'normal' | 'rush';
  createdAt: string;
  readyAt?: string;
}

export interface PaymentTransaction {
  id: string;
  reference: string;
  orderId: string;
  orderNumber: string;
  tableNumber: string;
  amount: number;
  method: 'mtn_momo' | 'airtel_money' | 'cash' | 'bank_card';
  status: 'pending' | 'verified' | 'failed' | 'refunded';
  providerRef: string;
  customerPhoneOrName: string;
  customerEmail?: string;
  transactionTime: string;
  verifiedBy?: string;
  notes?: string;
}

export interface CashSession {
  id: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  cashReceived: number;
  cardTotal: number;
  digitalTotal: number;
  refundsTotal: number;
  expectedCash: number;
  actualCash?: number;
  difference?: number;
  notes?: string;
  status: 'open' | 'closed';
}

export interface HotelRoom {
  id: string;
  roomNumber: string;
  type: 'standard' | 'deluxe' | 'suite' | 'executive';
  floor: number;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
  pricePerNight: number;
  housekeepingStatus: 'clean' | 'needs_cleaning' | 'cleaning_in_progress' | 'inspected';
  maintenanceAlert?: string;
}

export interface HotelReservation {
  id: string;
  reservationNumber: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  totalAmount: number;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  department?: string;
  importance: 'low' | 'normal' | 'high' | 'urgent';
  isRead: boolean;
  timestamp: string;
  relatedRecordId?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  role: string;
  department: string;
  timestamp: string;
  details: string;
}
