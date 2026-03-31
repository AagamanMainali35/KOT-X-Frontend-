// src/context/OrderContext.js
import React, { createContext, useState, useContext } from "react";
import { useTables } from "./TablesContext"; // import your TablesContext properly

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orderItems, setOrderItems] = useState([]);

  // get selectedTable from TablesContext
  const { selectedTable } = useTables();

  const addItem = (item) => {
  setOrderItems((prev) => {
    const existing = prev.find((i) => i.id === item.id);
    if (existing) {
      return prev.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
      );
    }
    return [...prev, { ...item }];
  });
};

  const updateQuantity = (itemId, quantity) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (itemId) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearOrder = () => setOrderItems([]);

  return (
    <OrderContext.Provider
      value={{
        orderItems,
        selectedTable,   // pass the table object from TablesContext
        addItem,
        updateQuantity,
        removeItem,
        clearOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};