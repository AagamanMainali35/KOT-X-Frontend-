import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  UtensilsCrossed, Salad, Beef, Soup, CakeSlice, Coffee,
  Search, X, Plus, Minus, ShoppingCart, Edit2, Trash2,
  Clock, ChefHat, Receipt, Zap, CheckCircle2,
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
  const Backend = import.meta.env.VITE_BACKEND;
  const [activeView, setActiveView] = useState("menu");
  const [category, setCategory]     = useState("All");
  const [search, setSearch]         = useState("");
  const [cartOpen, setCartOpen]     = useState(false);
  const [flashId, setFlashId]       = useState(null);

  const { selectedTable } = useTables();

  // Context shape: orderItems = [{ id, name, price, quantity }, ...]
  // .id on each orderItem IS the menu item id — no separate menuItemId field
  const { orderItems, addItem, removeItem } = useOrder();

  const { menuItems: rawMenuItems, loading, error } = useMenu();

  const searchRef = useRef(null);
  const cartRef   = useRef(null);

  // ── Normalise menu items from API ─────────────────────────────────────
  const menuItems = useMemo(() => {
    if (!rawMenuItems) return [];
    return rawMenuItems.map((item) => ({
      id:          item.id,
      name:        item.item_name,
      price:       Number(item.price),
      category:    item.category,
      image:       item.item_picture || "",
      prepTime:    10,
      isAvailable: item.is_available,
    }));
  }, [rawMenuItems]);

  // ── Close popover on outside click ───────────────────────────────────
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

  // ── Cart helpers ──────────────────────────────────────────────────────
  // orderItems[i].id === menu item id  →  match directly, no collision
  const getQty = (menuItemId) => orderItems.find((c) => c.id === menuItemId)?.quantity ?? 0;

  const cartCount = orderItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);

  // addItem in context expects { id, name, price, quantity }
  const handleAdd = (menuItem) => {
    addItem({ id: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: 1 });
    setFlashId(menuItem.id);
    setTimeout(() => setFlashId(null), 800);
  };

  // removeItem in context filters by .id — fully removes the entry
  // For decrement: if qty > 1 re-add with qty-1, else remove entirely
  const handleDecrement = (orderItem) => {
    removeItem(orderItem.id);
    if (orderItem.quantity > 1) {
      addItem({ ...orderItem, quantity: orderItem.quantity - 1 });
    }
  };

  // ── Filtering & grouping ──────────────────────────────────────────────
  const displayed = useMemo(() =>
    menuItems.filter((item) => {
      if (category !== "All" && item.category !== category) return false;
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }),
    [menuItems, category, search]
  );

  const countFor = (cat) =>
    cat === "All" ? menuItems.length : menuItems.filter((i) => i.category === cat).length;

  const grouped = useMemo(() => {
    if (category !== "All") return { [category]: displayed };
    return CATEGORIES.slice(1).reduce((acc, cat) => {
      const rows = displayed.filter((i) => i.category === cat);
      if (rows.length) acc[cat] = rows;
      return acc;
    }, {});
  }, [displayed, category]);

  // ── Stats ─────────────────────────────────────────────────────────────
  const statsData = [
    { label: "Total Items", value: menuItems.length, icon: <ChefHat size={15} /> },
    { label: "In Order",    value: cartCount,         icon: <ShoppingCart size={15} /> },
    { label: "Order Value", value: `₹${cartTotal.toLocaleString("en-IN")}`, icon: <Receipt size={15} /> },
  ];

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="main-content">
        <div className="menu-page">

          {/* ══ BANNER ══ */}
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

          {/* ══ BODY ══ */}
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
                      <span className="cat-pill-num">{countFor(cat)}</span>
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
                              {orderItems.map((item) => (
                                <div key={item.id} className="cart-pop-row">
                                  <span className="cpr-name">{item.name}</span>
                                  <div className="cpr-controls">
                                    <button
                                      className="cpr-btn"
                                      onClick={() => handleDecrement(item)}
                                    >
                                      <Minus size={10} />
                                    </button>
                                    <span className="cpr-qty">{item.quantity}</span>
                                    <button
                                      className="cpr-btn"
                                      onClick={() => handleAdd(item)}
                                    >
                                      <Plus size={10} />
                                    </button>
                                  </div>
                                  <span className="cpr-price">
                                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                  </span>
                                  <button
                                    className="cpr-del"
                                    onClick={() => removeItem(item.id)}
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
                displayed.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🍽️</div>
                    <p>No dishes match your filters</p>
                    <button onClick={() => { setSearch(""); setCategory("All"); }}>
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="item-list">
                    {Object.entries(grouped).map(([cat, rows]) => (
                      <div className="item-group" key={cat}>
                        <div className="group-header">
                          <span className="group-dot" style={{ background: CAT_META[cat]?.color }} />
                          <span className="group-name">{cat}</span>
                          <span className="group-count">{rows.length}</span>
                          <div className="group-line" />
                        </div>

                        {rows.map((item, idx) => {
                          const qty = getQty(item.id); // ✅ matches orderItems[i].id directly
                          const orderItem = orderItems.find((c) => c.id === item.id);

                          return (
                            <div
                              key={item.id}
                              className={`item-row ${qty > 0 ? "row-in-cart" : ""}`}
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

                                {/* Stepper — visible when item is in order */}
                                {qty > 0 && orderItem && (
                                  <div className="row-stepper">
                                    <button onClick={() => handleDecrement(orderItem)}>
                                      <Minus size={11} />
                                    </button>
                                    <span>{qty}</span>
                                    <button onClick={() => handleAdd(item)}>
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

                                {/* Add button — only when table selected and not yet in order */}
                                {selectedTable?.id && qty === 0 && (
                                  <button
                                    className={`row-add-btn ${flashId === item.id ? "flash" : ""}`}
                                    onClick={() => handleAdd(item)}
                                    title="Add to order"
                                  >
                                    {flashId === item.id
                                      ? <CheckCircle2 size={14} />
                                      : <Plus size={14} />
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