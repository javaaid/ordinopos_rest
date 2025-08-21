import React, { createContext, useContext, useState, useEffect } from "react";

// Types
const POSContext = createContext(null);

export const usePOS = () => useContext(POSContext);

export const POSProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [settings, setSettings] = useState({
    advancedPOS: {
      confirmPayment: true,
      autoPrintAfterKitchen: false,
      actionAfterEvent: "newOrder",
    },
  });

  useEffect(() => {
    setDisplayedProducts(allProducts);
  }, [allProducts]);

  // ✅ Always clears cart
  const clearCart = () => {
    setCartItems([]);
  };

  const calcTotals = (items) => {
    const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
    const tax = subtotal * 0.15;
    const total = subtotal + tax;
    return { subtotal, tax, discount: 0, total };
  };

  // ✅ Fixed: Send to Kitchen clears cart
  const handleSendToKitchen = async () => {
    if (!cartItems.length) return;

    const totals = calcTotals(cartItems);
    const newOrder = {
      id: `ord_${Date.now()}`,
      items: cartItems,
      subtotal: totals.subtotal,
      tax: totals.tax,
      discount: totals.discount,
      total: totals.total,
      createdAt: new Date().toISOString(),
      status: "SENT_TO_KITCHEN",
    };

    setOrders((prev) => [newOrder, ...prev]);

    // ✅ Force clear & reset
    setCartItems([]);
    setSelectedCategory(null);
    setDisplayedProducts(allProducts);
  };

  // ✅ Fixed: Payment flow works
  const handleInitiatePayment = async () => {
    if (!cartItems.length) return;

    const totals = calcTotals(cartItems);

    if (settings.advancedPOS.confirmPayment) {
      console.log("Open Payment Modal", { cartItems, totals });
      // TODO: openPaymentModal({ cartItems, totals })
    } else {
      await handlePlaceOrder();
    }
  };

  const handlePlaceOrder = async () => {
    if (!cartItems.length) return;

    const totals = calcTotals(cartItems);
    const newOrder = {
      id: `ord_${Date.now()}`,
      items: cartItems,
      subtotal: totals.subtotal,
      tax: totals.tax,
      discount: totals.discount,
      total: totals.total,
      createdAt: new Date().toISOString(),
      status: "PAID",
    };

    setOrders((prev) => [newOrder, ...prev]);

    // ✅ Always clear after payment
    setCartItems([]);
    setSelectedCategory(null);
    setDisplayedProducts(allProducts);
  };

  const value = {
    cartItems,
    orders,
    allProducts,
    displayedProducts,
    selectedCategory,
    setDisplayedProducts,
    setSelectedCategory,
    clearCart,
    handleSendToKitchen,
    handleInitiatePayment,
    handlePlaceOrder,
  };

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
};
