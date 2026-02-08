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
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateDeliveryOption: (itemId: string, deliveryOption: 'pickup' | 'delivery') => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
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

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number) => {
    const availableOptions = item.availableOptions && item.availableOptions.length > 0
      ? item.availableOptions
      : (['pickup', 'delivery'] as ('pickup' | 'delivery')[]);
    const fallbackDeliveryOption =
      item.deliveryOption ??
      (availableOptions.includes('pickup') ? 'pickup' : availableOptions[0]);

    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // Update existing item quantity
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        // Add new item
        return [...prev, { ...item, deliveryOption: fallbackDeliveryOption, availableOptions, quantity }];
      }
    });
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
    getTotalItems,
    getTotalPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
