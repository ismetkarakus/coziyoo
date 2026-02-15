import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  cookName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  currentStock?: number;
  dailyStock?: number;
  deliveryOption?: 'pickup' | 'delivery';
  availableOptions?: ('pickup' | 'delivery')[];
  deliveryFee?: number;
  allergens?: string[];
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => number;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateDeliveryOption: (itemId: string, deliveryOption: 'pickup' | 'delivery') => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
  getRemainingStock: (itemId: string, baseStock: number) => number;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number): number => {
    const availableOptions = item.availableOptions && item.availableOptions.length > 0
      ? item.availableOptions
      : (['pickup', 'delivery'] as ('pickup' | 'delivery')[]);
    const fallbackDeliveryOption =
      item.deliveryOption ??
      (availableOptions.includes('pickup') ? 'pickup' : availableOptions[0]);
    let updatedQuantity = quantity;

    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        updatedQuantity = existingItem.quantity + quantity;
        // Update existing item quantity
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        updatedQuantity = quantity;
        // Add new item
        return [...prev, { ...item, deliveryOption: fallbackDeliveryOption, availableOptions, quantity }];
      }
    });

    return updatedQuantity;
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const updateDeliveryOption = (itemId: string, deliveryOption: 'pickup' | 'delivery') => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, deliveryOption } : item
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getItemQuantity = (itemId: string): number => {
    const item = cartItems.find((cartItem) => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const getRemainingStock = (itemId: string, baseStock: number): number => {
    return Math.max(0, baseStock - getItemQuantity(itemId));
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };


  const value: CartContextType = {
    cartItems,
    addToCart,
    updateQuantity,
    updateDeliveryOption,
    removeFromCart,
    clearCart,
    getItemQuantity,
    getRemainingStock,
    getTotalItems,
    getTotalPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
