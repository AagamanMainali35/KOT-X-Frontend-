import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  UtensilsCrossed, Salad, Beef, Soup, CakeSlice, Coffee,
  Search, X, Plus, Minus, ShoppingCart, Edit2, Trash2,
  Clock, ChefHat, Receipt, Zap, CheckCircle2, AlertCircle,
} from "lucide-react";
import Sidebar from "../component/Sidebar/Sidebars";
import "../assets/css/Menu.css";
import { useTables } from "../context/TablesContext";
import { useOrder } from "../context/OrderItemContext";
import { useMenu } from "../context/MenuContext";

const CATEGORIES = ["All", "Appetizer", "Main Course", "Sides", "Desserts", "Beverage"];
const CAT_META = {
  All:           { icon: <UtensilsCrossed size={16} />, color: "#2563eb" },
  Appetizer:     { icon: <Salad size={16} />,           color: "#f59e0b" },
  "Main Course": { icon: <Beef size={16} />,            color: "#ef4444" },
  Sides:         { icon: <Soup size={16} />,            color: "#22c55e" },
  Desserts:      { icon: <CakeSlice size={16} />,       color: "#ec4899" },
  Beverage:      { icon: <Coffee size={16} />,          color: "#8b5cf6" },
};

export default function Menu() {
  const [activeView, setActiveView] = useState("menu");
  const [category, setCategory]     = useState("All");
  const [search, setSearch]         = useState("");
  const [cartOpen, setCartOpen]     = useState(false);
  const [flashId, setFlashId]       = useState(null);
  const [pendingAdds, setPendingAdds] = useState({});

  const { selectedTable } = useTables();
  const { orderItems, setOrderItems, addItem, removeItem, updateQuantity, orderId, errorMessage } = useOrder();
  const { menuItems, loading, error } = useMenu();

  const searchRef = useRef(null);
  const cartRef   = useRef(null);
  
  // Track pending requests to prevent race conditions
  const pendingRequests = useRef(new Map());
  const requestCounter = useRef(0);

  // Transform menu items for display
  const displayMenuItems = useMemo(() => {
    if (!menuItems) return [];
    return menuItems.map((item) => ({
      id:          item.id,
      name:        item.item_name,
      price:       Number(item.price),
      category:    item.category,
      image:       item.item_picture || "",
      prepTime:    10,
      isAvailable: item.is_available,
    }));
  }, [menuItems]);

  useEffect(() => {
    if (!cartOpen) return;
    const handler = (e) => {
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [cartOpen]);

  // Helper functions
  const getQuantity = (menuItemId) => {
    const orderItem = orderItems.find(item => item.Item?.item_id === menuItemId);
    return orderItem?.quantity ?? 0;
  };

  const cartCount = orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const cartTotal = orderItems.reduce((sum, item) => sum + (Number(item.Item?.price || 0) * (item.quantity || 0)), 0);

  const handleAddItem = async (menuItem) => {
    if (pendingAdds[menuItem.id]) return;
    
    const existingItem = orderItems.find(item => item.Item?.item_id === menuItem.id);
    
    if (existingItem) {
      // Item exists - just update quantity
      const newQuantity = existingItem.quantity + 1;
      const updatedItems = orderItems.map(item =>
        item.OrderItemID === existingItem.OrderItemID
          ? { ...item, quantity: newQuantity }
          : item
      );
      setOrderItems(updatedItems);
      updateQuantityWithTracking(orderId, existingItem.OrderItemID, menuItem.id, newQuantity);
    } else {
      // New item - add with optimistic update
      setPendingAdds(prev => ({ ...prev, [menuItem.id]: true }));
      
      const tempId = Date.now();
      const tempOrderItem = {
        OrderItemID: tempId,
        Item: {
          item_id: menuItem.id,
          item_name: menuItem.name,
          image: menuItem.image,
          price: menuItem.price
        },
        quantity: 1,
        special_note: "",
        isTemp: true
      };
      setOrderItems(prev => [...prev, tempOrderItem]);
      
      // Make API call
      const body = {
        order_ins: orderId,
        order_items: menuItem.id,
        quantity: 1,
        special_note: ""
      };
      
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND}Order/AddItem/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        
        const result = await response.json();
        console.log("Add item response:", result);
        
        if (result.status === 201 && result.data) {
          // Replace temp item with real item from response
          const realOrderItem = {
            OrderItemID: result.data.OrderItemID,
            Item: result.data.Item,
            quantity: result.data.quantity,
            special_note: result.data.special_note,
            isTemp: false
          };
          
          setOrderItems(prev => 
            prev.map(item => 
              item.OrderItemID === tempId ? realOrderItem : item
            )
          );
        } else {
          // If something went wrong, remove the temp item
          setOrderItems(prev => prev.filter(item => item.OrderItemID !== tempId));
          console.error("Failed to add item:", result);
        }
      } catch (err) {
        console.error("Error adding item:", err);
        setOrderItems(prev => prev.filter(item => item.OrderItemID !== tempId));
      } finally {
        setPendingAdds(prev => ({ ...prev, [menuItem.id]: false }));
      }
    }
    
    setFlashId(menuItem.id);
    setTimeout(() => setFlashId(null), 800);
  };

  const handleDecrementItem = (menuItemId) => {
    const existingItem = orderItems.find(item => item.Item?.item_id === menuItemId);
    
    if (existingItem) {
      // Don't allow decrement if it's a temp item
      if (existingItem.isTemp) {
        console.log("Cannot update temp item, waiting for real ID");
        return;
      }
      
      if (existingItem.quantity > 1) {
        const newQuantity = existingItem.quantity - 1;
        const updatedItems = orderItems.map(item =>
          item.OrderItemID === existingItem.OrderItemID
            ? { ...item, quantity: newQuantity }
            : item
        );
        setOrderItems(updatedItems);
        updateQuantityWithTracking(orderId, existingItem.OrderItemID, menuItemId, newQuantity);
      } else {
        const updatedItems = orderItems.filter(item => item.OrderItemID !== existingItem.OrderItemID);
        setOrderItems(updatedItems);
        removeItem(orderId, existingItem.OrderItemID, menuItemId);
      }
    }
  };

  // Wrapper function to handle race conditions for updates
  const updateQuantityWithTracking = (orderId, orderItemId, menuItemId, newQuantity) => {
    // Generate unique request ID
    const requestId = ++requestCounter.current;
    
    // Store this request as pending for this orderItemId
    pendingRequests.current.set(orderItemId, requestId);
    
    // Prepare API request
    const body = {
      "Items": [
        {
          "OrderItemID": orderItemId,
          "order_items": menuItemId,
          "quantity": newQuantity
        }
      ]
    };
    
    // Make API call
    fetch(`${import.meta.env.VITE_BACKEND}Order/update/${orderId}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(data => {
        const latestRequestId = pendingRequests.current.get(orderItemId);
        if (latestRequestId === requestId) {
          console.log("Applying update for request:", requestId, "Quantity:", newQuantity);
          if (data.Items) {
            setOrderItems(data.Items);
          } else if (data.order_items) {
            setOrderItems(data.order_items);
          }
          pendingRequests.current.delete(orderItemId);
        } else {
          console.log("Ignoring stale response for request:", requestId, "Latest is:", latestRequestId);
        }
      })
      .catch(err => {
        console.error("Update failed:", err);
        const latestRequestId = pendingRequests.current.get(orderItemId);
        if (latestRequestId === requestId) {
          pendingRequests.current.delete(orderItemId);
        }
      });
  };

  // Filter and group items
  const filteredItems = useMemo(() =>
    displayMenuItems.filter((item) => {
      if (category !== "All" && item.category !== category) return false;
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }),
    [displayMenuItems, category, search]
  );

  const getCategoryCount = (cat) =>
    cat === "All" ? displayMenuItems.length : displayMenuItems.filter((i) => i.category === cat).length;

  const groupedItems = useMemo(() => {
    if (category !== "All") return { [category]: filteredItems };
    return CATEGORIES.slice(1).reduce((acc, cat) => {
      const rows = filteredItems.filter((i) => i.category === cat);
      if (rows.length) acc[cat] = rows;
      return acc;
    }, {});
  }, [filteredItems, category]);

  // Stats data
  const statsData = [
    { label: "Total Items", value: displayMenuItems.length, icon: <ChefHat size={15} /> },
    { label: "In Order",    value: cartCount,         icon: <ShoppingCart size={15} /> },
    { label: "Order Value", value: `₹${cartTotal.toLocaleString("en-IN")}`, icon: <Receipt size={15} /> },
  ];

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="main-content">
        <div className="menu-page">

          {/* Error Toast */}
          {errorMessage && (
            <div className="error-toast-global" style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              animation: 'slideIn 0.3s ease-out'
            }}>
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* BANNER */}
          <div className="menu-banner">
            <div className="banner-left">
              <span className="banner-eyebrow">
                <Zap size={13} /> Kitchen Management
              </span>
              <h1 className="banner-title">Menu</h1>
              {selectedTable?.id && (
                <div className="banner-table-chip">Table {selectedTable.id}</div>
              )}
            </div>
            <div className="banner-right">
              <div className="banner-stats">
                {statsData.map((s) => (
                  <div className="stat-block" key={s.label}>
                    <div className="stat-icon">{s.icon}</div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="menu-body">
            <div className="menu-left">

              {/* Search */}
              <div className="top-bar">
                <div className="search-wrap" onClick={() => searchRef.current?.focus()}>
                  <Search size={15} />
                  <input
                    ref={searchRef}
                    placeholder="Search dishes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button className="search-clear" onClick={() => setSearch("")}>
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Category rail + cart icon */}
              <div className="cat-rail">
                <div className="rails">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      className={`cat-pill ${category === cat ? "active" : ""}`}
                      style={category === cat ? { "--pill-color": CAT_META[cat].color } : {}}
                      onClick={() => setCategory(cat)}
                    >
                      <span className="cat-pill-icon">{CAT_META[cat].icon}</span>
                      <span>{cat}</span>
                      <span className="cat-pill-num">{getCategoryCount(cat)}</span>
                    </button>
                  ))}
                </div>

                {selectedTable?.id && (
                  <div className="cart-icon-wrap" ref={cartRef}>
                    <button
                      className={`cart-icon-btn ${cartCount > 0 ? "has-items" : ""}`}
                      onClick={() => setCartOpen((o) => !o)}
                      title="View order"
                    >
                      <ShoppingCart size={18} />
                      {cartCount > 0 && (
                        <span className="cart-icon-badge">{cartCount}</span>
                      )}
                    </button>

                    {cartOpen && (
                      <div className="cart-popover">
                        <div className="cart-pop-arrow" />
                        <div className="cart-pop-header">
                          <div className="cart-pop-title">
                            <ShoppingCart size={14} />
                            <span>Current Order</span>
                            {cartCount > 0 && (
                              <span className="cart-pop-count">{cartCount}</span>
                            )}
                          </div>
                          <button className="cart-pop-close" onClick={() => setCartOpen(false)}>
                            <X size={14} />
                          </button>
                        </div>

                        {orderItems.length === 0 ? (
                          <div className="cart-pop-empty">
                            <ShoppingCart size={26} strokeWidth={1.2} />
                            <p>No items in order</p>
                          </div>
                        ) : (
                          <>
                            <div className="cart-pop-list">
                              {orderItems.map((orderItem) => (
                                <div key={orderItem.OrderItemID} className="cart-pop-row">
                                  <span className="cpr-name">
                                    {orderItem.Item?.item_name}
                                    {orderItem.isTemp && <span style={{ fontSize: '10px', marginLeft: '5px', color: '#f59e0b' }}>(adding...)</span>}
                                  </span>
                                  <div className="cpr-controls">
                                    <button
                                      className="cpr-btn"
                                      onClick={() => handleDecrementItem(orderItem.Item?.item_id)}
                                      disabled={orderItem.isTemp}
                                    >
                                      <Minus size={10} />
                                    </button>
                                    <span className="cpr-qty">{orderItem.quantity}</span>
                                    <button
                                      className="cpr-btn"
                                      onClick={() => handleAddItem({
                                        id: orderItem.Item?.item_id,
                                        name: orderItem.Item?.item_name,
                                        price: orderItem.Item?.price,
                                        image: orderItem.Item?.image
                                      })}
                                      disabled={orderItem.isTemp}
                                    >
                                      <Plus size={10} />
                                    </button>
                                  </div>
                                  <span className="cpr-price">
                                    ₹{(orderItem.Item?.price * orderItem.quantity).toLocaleString("en-IN")}
                                  </span>
                                  <button
                                    className="cpr-del"
                                    onClick={() => {
                                      if (!orderItem.isTemp) {
                                        const updatedItems = orderItems.filter(i => i.OrderItemID !== orderItem.OrderItemID);
                                        setOrderItems(updatedItems);
                                        removeItem(orderId, orderItem.OrderItemID, orderItem.Item?.item_id);
                                      }
                                    }}
                                    disabled={orderItem.isTemp}
                                  >
                                    <X size={11} />
                                  </button>
                                </div>
                              ))}
                            </div>

                            <div className="cart-pop-footer">
                              <div className="cart-pop-total">
                                <span className="cart-pop-total-label">Total</span>
                                <span className="cart-pop-amount">
                                  ₹{cartTotal.toLocaleString("en-IN")}
                                </span>
                              </div>
                              <button className="cart-pop-order-btn">
                                <Receipt size={14} />
                                Place Order
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Loading / error */}
              {loading && (
                <div className="empty-state">
                  <div className="empty-icon">⏳</div>
                  <p>Loading menu…</p>
                </div>
              )}
              {error && (
                <div className="empty-state">
                  <div className="empty-icon">⚠️</div>
                  <p>Failed to load menu</p>
                </div>
              )}

              {/* Item list */}
              {!loading && !error && (
                filteredItems.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🍽️</div>
                    <p>No dishes match your filters</p>
                    <button onClick={() => { setSearch(""); setCategory("All"); }}>
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="item-list">
                    {Object.entries(groupedItems).map(([cat, rows]) => (
                      <div className="item-group" key={cat}>
                        <div className="group-header">
                          <span className="group-dot" style={{ background: CAT_META[cat]?.color }} />
                          <span className="group-name">{cat}</span>
                          <span className="group-count">{rows.length}</span>
                          <div className="group-line" />
                        </div>

                        {rows.map((item, idx) => {
                          const quantity = getQuantity(item.id);
                          const orderItem = orderItems.find(oi => oi.Item?.item_id === item.id);

                          return (
                            <div
                              key={item.id}
                              className={`item-row ${quantity > 0 ? "row-in-cart" : ""}`}
                              style={{ animationDelay: `${idx * 0.04}s` }}
                            >
                              <div className="row-left">
                                <span className="row-index">{String(idx + 1).padStart(2, "0")}</span>
                                <div className="row-info">
                                  <span className="row-name">{item.name}</span>
                                  <div className="row-meta">
                                    <Clock size={11} />
                                    <span>{item.prepTime} min</span>
                                  </div>
                                </div>
                              </div>

                              <div className="row-right">
                                <span className="row-price">
                                  ₹{item.price.toLocaleString("en-IN")}
                                </span>

                                {/* Stepper */}
                                {quantity > 0 && orderItem && (
                                  <div className="row-stepper">
                                    <button 
                                      onClick={() => handleDecrementItem(item.id)}
                                      disabled={orderItem.isTemp}
                                    >
                                      <Minus size={11} />
                                    </button>
                                    <span>
                                      {quantity}
                                      {orderItem.isTemp && <span style={{ fontSize: '10px', marginLeft: '4px' }}>⏳</span>}
                                    </span>
                                    <button 
                                      onClick={() => handleAddItem(item)}
                                      disabled={orderItem.isTemp}
                                    >
                                      <Plus size={11} />
                                    </button>
                                  </div>
                                )}

                                <button
                                  className="row-icon-btn"
                                  onClick={() => alert(`Edit item ${item.id}`)}
                                  title="Edit"
                                >
                                  <Edit2 size={13} />
                                </button>

                                <button
                                  className="row-icon-btn row-del"
                                  onClick={() => alert(`Delete item ${item.id}`)}
                                  title="Delete"
                                >
                                  <Trash2 size={13} />
                                </button>

                                {/* Add button */}
                                {selectedTable?.id && quantity === 0 && (
                                  <button
                                    className={`row-add-btn ${flashId === item.id ? "flash" : ""}`}
                                    onClick={() => handleAddItem(item)}
                                    title="Add to order"
                                    disabled={pendingAdds[item.id]}
                                  >
                                    {flashId === item.id
                                      ? <CheckCircle2 size={14} />
                                      : pendingAdds[item.id] ? <span>...</span> : <Plus size={14} />
                                    }
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}