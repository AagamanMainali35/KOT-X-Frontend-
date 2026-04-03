import React, { createContext, useState, useContext, useEffect } from "react";
import { useTables } from "./TablesContext";

const OrderContext = createContext();
export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(true); // loading state
  const { selectedTable } = useTables();
  const Backend = import.meta.env.VITE_BACKEND;

  // Simulate initial loading for minimum 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 350);

    return () => clearTimeout(timer);
  }, []);

  const addItem = (item) => {
    setOrderItems((prevItems) => {
      const existingItem = prevItems.find(
        (i) => i.Item.item_id === item.Item.item_id
      );

      if (existingItem) {
        return prevItems.map((i) =>
          i.Item.item_id === item.Item.item_id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }

      return [...prevItems, item];
    });
  };

  const updateQuantity = (OrderItemID, itemId, newQuantity) => {
    setOrderItems((prevItems) =>
      prevItems.map((i) =>
        i.Item.item_id === itemId ? { ...i, quantity: newQuantity } : i
      )
    );
  };

  const removeItem = (itemId) => {
    setOrderItems((prevItems) =>
      prevItems.filter((i) => i.Item.item_id !== itemId)
    );
  };

  const clearOrder = () => {
    setOrderItems([]);
    setOrderId(null);
  };

  if (loading) {
    return (
      <div style={{ padding: "1rem" }}>
        {/* Skeleton Loader */}
        <div style={{ background: "#e0e0e0", height: "20px", marginBottom: "10px", borderRadius: "4px" }}></div>
        <div style={{ background: "#e0e0e0", height: "20px", marginBottom: "10px", borderRadius: "4px" }}></div>
        <div style={{ background: "#e0e0e0", height: "20px", marginBottom: "10px", borderRadius: "4px" }}></div>
      </div>
    );
  }

  return (
    <OrderContext.Provider
      value={{
        orderItems,
        orderId,
        selectedTable,
        addItem,
        updateQuantity,
        removeItem,
        clearOrder,
        setOrderItems,
        setOrderId,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};