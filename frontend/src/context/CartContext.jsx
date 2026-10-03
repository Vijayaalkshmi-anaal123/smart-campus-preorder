import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('campus_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentShop, setCurrentShop] = useState(() => {
    const saved = localStorage.getItem('campus_cart_shop');
    return saved ? JSON.parse(saved) : null;
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('campus_cart', JSON.stringify(items));
    if (items.length === 0) {
      setCurrentShop(null);
      localStorage.removeItem('campus_cart_shop');
    } else if (currentShop) {
      localStorage.setItem('campus_cart_shop', JSON.stringify(currentShop));
    }
  }, [items, currentShop]);

  const addToCart = (product, shop, quantity = 1) => {
    if (product.stock_status === 'out_of_stock') {
      alert("This item is currently out of stock.");
      return false;
    }

    // Check if adding from a different shop
    if (currentShop && currentShop.id !== shop.id && items.length > 0) {
      const confirmClear = window.confirm(
        `Your cart already has items from "${currentShop.name}". Would you like to clear your cart and start ordering from "${shop.name}"?`
      );
      if (!confirmClear) {
        return false;
      }
      // Clear and proceed with new shop
      setItems([{ product, quantity }]);
      setCurrentShop(shop);
      setIsCartOpen(true);
      return true;
    }

    if (!currentShop) {
      setCurrentShop(shop);
    }

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((it) => it.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prevItems, { product, quantity }];
      }
    });

    setIsCartOpen(true);
    return true;
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setItems((prevItems) => {
      const updated = prevItems.filter((item) => item.product.id !== productId);
      if (updated.length === 0) {
        setCurrentShop(null);
      }
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    setCurrentShop(null);
    localStorage.removeItem('campus_cart');
    localStorage.removeItem('campus_cart_shop');
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const finalTotal = subtotal;

  return (
    <CartContext.Provider value={{
      items,
      currentShop,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartCount,
      subtotal,
      finalTotal,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
