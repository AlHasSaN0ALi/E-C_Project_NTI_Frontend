export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
  total: number;
}

export interface ShippingAddress {
  name: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface PaymentMethod {
  type: 'credit_card' | 'debit_card' | 'paypal' | 'cash_on_delivery';
  last4?: string;
  brand?: string;
}

export interface ShippingMethod {
  name: string;
  estimatedDays: number;
  cost: number;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  description: string;
  timestamp: Date;
  notes?: string;
}

export interface Order {
  _id: string;
  user: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  shippingMethod?: ShippingMethod;
  timeline?: OrderTimelineEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  notes?: string;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

export interface OrderListResponse {
  success: boolean;
  data: Order[];
  total: number;
  page: number;
  limit: number;
}
