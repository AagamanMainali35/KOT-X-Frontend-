import React, { createContext, useState, useContext } from "react";
import { useTables } from "./TablesContext";

const OrderContext = createContext();
export const useOrder = () => useContext(OrderContext);
export const OrderProvider = ({ children }) => {
  const [orderItems, setOrderItems] = useState([]);
  const { selectedTable } = useTables();
  const Backend=import.meta.env.VITE_BACKEND

  const addItem = (item) => {
    setOrderItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);

      // Step 2: If it exists, increase its quantity
      if (existingItem) {
        const updatedItems = prevItems.map((i) => {
          if (i.id === item.id) {
            return {
              ...i, // keep the other properties
              quantity: i.quantity + item.quantity, // increase quantity
            };
          }
          return i; // leave other items unchanged
        });
        return updatedItems;
      }

      // Step 3: If it doesn't exist, just add it to the list
      return [...prevItems, item];
    });
  };

 const updateQuantity = (Order_id,itemId, newQuantity) => {
  const payload={
    "Items":[
      {
          "OrderItemID": Order_id, 
          "order_items":itemId,
          "quantity": newQuantity,
      }
    ]
  }
  axios.patch(`${Backend}Order/update/${Order_id}/`, payload)
  .then(res=>{
    console.log(res.data)
  })
  .catch(err=>{
    console.log(err)
  })
};


  const removeItem = (itemId) => {
    setOrderItems((prevItems) =>
      prevItems.filter((item) => item.id !== itemId)
    );
  };


  const clearOrder = () => setOrderItems([]);


  return (
    <OrderContext.Provider
      value={{
        orderItems,
        selectedTable,
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