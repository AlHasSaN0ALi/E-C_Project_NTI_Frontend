export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    thumbnail: string;
    stock: number;
  };
  quantity: number;
  price: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartResponse {
  success: boolean;
  message: string;
  data: Cart;
}
