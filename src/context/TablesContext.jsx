import { createContext, useContext, useState } from "react";

const TablesContext = createContext();

export const useTables = () => {
  const context = useContext(TablesContext);
  if (!context) {
    throw new Error("useTables must be used within TablesProvider");
  }
  return context;
};

export const TablesProvider = ({ children }) => {
  const [tables, setTables] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  const addTable = (tableData) => {
    //NOTE: add create tbale api call here
    // setTables([...tables, newTable]);  NOTE: Add api data here
  };

  const removeTable = (tableId) => {
    setTables(tables.filter((t) => t.id !== tableId));
    if (selectedTable?.id === tableId) setSelectedTable(null); // deselect if removed
    //NOTE: call the delete table API
  };

  const updateTable = (tableId, updates) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, ...updates } : t)),
    );
    //NOTE: call the update Table API
  };

  const getTableById = (tableId) => tables.find((t) => t.id === tableId);

  const getAvailableTables = () =>
    tables.filter((t) => t.status === "available");

  const getOccupiedTables = () => tables.filter((t) => t.status === "occupied");

  return (
    <TablesContext.Provider
      value={{
        tables,
        addTable,
        removeTable,
        updateTable,
        getTableById,
        getAvailableTables,
        getOccupiedTables,
        selectedTable, // <-- expose selected table
        setSelectedTable, // <-- expose setter
      }}
    >
      {children}
    </TablesContext.Provider>
  );
};
