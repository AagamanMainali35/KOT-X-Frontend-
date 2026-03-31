import React, { useState, useMemo , useEffect } from 'react';
import axios from "axios";

import {
  Search, X, Plus, Minus, ShoppingCart,
  Filter, Star, Edit2, Trash2, Eye, EyeOff,
  Clock, ChevronDown, CheckCircle2
} from 'lucide-react';
import Sidebar from '../component/Sidebar/Sidebars';
import '../assets/css/Menu.css';
import { useTables } from '../context/TablesContext';
import { useOrder } from '../context/OrderContext';

const INITIAL_ITEMS = [
  { id: 1,  name: 'Tomato Basil Soup',    category: 'Starters', price: 299,  available: true,  prepTime: 10, starred: false },
  { id: 2,  name: 'Caesar Salad',         category: 'Starters', price: 349,  available: true,  prepTime: 8,  starred: false },
  { id: 3,  name: 'Garlic Bread',         category: 'Starters', price: 199,  available: true,  prepTime: 5,  starred: true  },
  { id: 4,  name: 'Spring Rolls',         category: 'Starters', price: 279,  available: true, prepTime: 12, starred: false },
  { id: 5,  name: 'Margherita Pizza',     category: 'Mains',    price: 599,  available: true,  prepTime: 20, starred: true  },
  { id: 6,  name: 'Grilled Salmon',       category: 'Mains',    price: 899,  available: true,  prepTime: 25, starred: false },
  { id: 7,  name: 'Veggie Burger',        category: 'Mains',    price: 449,  available: true, prepTime: 15, starred: false },
  { id: 8,  name: 'Chicken Alfredo',      category: 'Mains',    price: 649,  available: true,  prepTime: 18, starred: false },
  { id: 9,  name: 'Beef Tenderloin',      category: 'Mains',    price: 1199, available: true,  prepTime: 30, starred: true  },
  { id: 10, name: 'French Fries',         category: 'Sides',    price: 149,  available: true, prepTime: 8,  starred: false },
  { id: 11, name: 'Mashed Potatoes',      category: 'Sides',    price: 179,  available: true,  prepTime: 10, starred: false },
  { id: 12, name: 'Steamed Broccoli',     category: 'Sides',    price: 159,  available: true,  prepTime: 7,  starred: false },
  { id: 13, name: 'Chocolate Lava Cake',  category: 'Desserts', price: 329,  available: true,  prepTime: 15, starred: true  },
  { id: 14, name: 'Tiramisu',             category: 'Desserts', price: 299,  available: true,  prepTime: 5,  starred: false },
  { id: 15, name: 'Cheesecake Slice',     category: 'Desserts', price: 279,  available: true, prepTime: 5,  starred: false },
  { id: 16, name: 'Fresh Lemonade',       category: 'Drinks',   price: 129,  available: true,  prepTime: 3,  starred: false },
  { id: 17, name: 'Mango Smoothie',       category: 'Drinks',   price: 199,  available: true,  prepTime: 5,  starred: false },
  { id: 18, name: 'Cappuccino',           category: 'Drinks',   price: 169,  available: true,  prepTime: 4,  starred: false },
];

const CATEGORIES = ['All', 'Starters', 'Mains', 'Sides', 'Desserts', 'Drinks'];

export default function Menu() {
  const Backend = import.meta.env.VITE_BACKEND; 
  const [activeView, setActiveView]   = useState('menu');
  const [items, setItems]             = useState(INITIAL_ITEMS);
  const [category, setCategory]       = useState('All');
  const [search, setSearch]           = useState('');
  const [filterAvail, setFilterAvail] = useState('all');
  const [cart, setCart]               = useState([]);
  const [cartOpen, setCartOpen]       = useState(false);
  const [flashId, setFlashId]         = useState(null);
  const { selectedTable } = useTables();
  const { orderItems } = useOrder();
  useEffect(() => {
    axios.get(`${Backend}Order/${selectedTable.id}`)
    .then(res=>{
      for (const item of res.data.Items) {
         const apiCartItems = res.data.Items.map(orderItem => ({
        id: orderItem.Item.item_id,
        name: orderItem.Item.item_name,
        price: orderItem.Item.price,
        quantity: orderItem.quantity,
        special_note: orderItem.special_note || '',
        image: orderItem.Item.image || ''
      }));
      setCart(apiCartItems);
      console.log(JSON.stringify(item, null, 2));
      }
    })
    .catch(err=>{
      console.log(err)
    })
  }, [selectedTable, orderItems]);

  /* item actions */
  // const toggleStar  = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, starred: !i.starred }    : i));
  const toggleAvail = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, available: !i.available } : i));
  const deleteItem  = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const editItem    = (id) => alert(`Edit item ${id} — wire this to your edit modal/page.`);

  /* cart */
  const getQty    = (id) => cart.find(c => c.id === id)?.quantity ?? 0;
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      if (ex) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
    setFlashId(item.id);
    setTimeout(() => setFlashId(null), 800);
  };

  const removeFromCart  = (id) => setCart(prev => {
    const ex = prev.find(c => c.id === id);
    if (!ex) return prev;
    if (ex.quantity === 1) return prev.filter(c => c.id !== id);
    return prev.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c);
  });
  const deleteFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id));

  /* filtering */
  const displayed = useMemo(() => items.filter(item => {
    if (filterAvail === 'available'   && !item.available) return false;
    if (filterAvail === 'unavailable' &&  item.available) return false;
    if (category !== 'All' && item.category !== category) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [items, category, search, filterAvail]);

  const countFor = (cat) =>
    cat === 'All' ? items.length : items.filter(i => i.category === cat).length;

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <main className="main-content">
        <div className="menu-page">

          {/* ── Header ── */}
          <div className="menu-page-header">
            <div>
              <h1 className="page-title" style={{ margin: 0 }}>Menu</h1>
              <p className="menu-subtitle">Manage your menu items across all categories</p>
            </div>
            <button className="cart-trigger" onClick={() => setCartOpen(o => !o)}>
              <ShoppingCart size={18} />
              <span>Cart</span>
              {cartCount > 0 && <span className="cart-trigger-badge">{cartCount}</span>}
              <span className="cart-trigger-total">₹{cartTotal.toLocaleString('en-IN')}</span>
              <ChevronDown size={15} style={{ transition: 'transform .2s', transform: cartOpen ? 'rotate(180deg)' : '' }} />
            </button>
          </div>

          {/* ── Cart drawer ── */}
          {cartOpen && (
            <div className="cart-drawer">
              <div className="cart-drawer-header">
                <span className="cart-drawer-title"><ShoppingCart size={15} /> Order ({cartCount} items)</span>
                <button className="cart-drawer-close" onClick={() => setCartOpen(false)}><X size={15} /></button>
              </div>
              {cart.length === 0 ? (
                <p className="cart-empty-msg">No items added yet.</p>
              ) : (
                <>
                  <div className="cart-item-list">
                    {cart.map(item => (
                      <div key={item.id} className="cart-row">
                        <div className="cart-row-info">
                          <span className="cart-row-name">{item.name}</span>
                          <span className="cart-row-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="cart-row-controls">
                          <button className="cqbtn" onClick={() => removeFromCart(item.id)}><Minus size={11} /></button>
                          <span className="cqnum">{item.quantity}</span>
                          <button className="cqbtn" onClick={() => addToCart(item)}><Plus size={11} /></button>
                          <button className="cdel"  onClick={() => deleteFromCart(item.id)}><X size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cart-drawer-footer">
                    <div className="cart-total-row">
                      <span>Total</span>
                      <span className="cart-total-amount">₹{cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <button className="place-order-btn">Place Order</button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Controls ── */}
          <div className="menu-controls-bar">
            <div className="menu-search-box">
              <Search size={16} className="search-icon" />
              <input
                placeholder="Search menu items..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>}
            </div>
            <div className="avail-filter-group">
              {[
                { key: 'all',         label: `All (${items.length})` },
                { key: 'available',   label: `Available (${items.filter(i => i.available).length})` },
                { key: 'unavailable', label: `Unavailable (${items.filter(i => !i.available).length})` },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`avail-btn ${filterAvail === key ? 'active' : ''}`}
                  onClick={() => setFilterAvail(key)}
                >
                  {key === 'all' && <Filter size={12} />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Category tabs ── */}
          <div className="category-tabs">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`cat-tab ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
                <span className="cat-tab-count">{countFor(cat)}</span>
              </button>
            ))}
          </div>

          <p className="results-label">
            Showing <strong>{displayed.length}</strong> item{displayed.length !== 1 ? 's' : ''}
            {category !== 'All' ? ` in ${category}` : ''}
            {search ? ` matching "${search}"` : ''}
          </p>

          {/* ── Grid ── */}
          {displayed.length === 0 ? (
            <div className="menu-empty-state">
              <Search size={40} strokeWidth={1.5} />
              <p>No items found</p>
              <button onClick={() => { setSearch(''); setCategory('All'); setFilterAvail('all'); }}>
                Reset filters
              </button>
            </div>
          ) : (
            <div className="menu-items-grid">
              {displayed.map(item => {
                const qty = getQty(item.id);
                return (
                  <div key={item.id} className={`menu-card ${!item.available ? 'mc-unavail' : ''} ${qty > 0 ? 'mc-in-cart' : ''}`}>

                    {/* Top row: name + price */}
                    <div className="mc-top">
                      <div className="mc-info">
                        <h3 className="mc-name">{item.name}</h3>
                        <p className="mc-category">{item.category}</p>
                        <div className="mc-prep">
                          <Clock size={13} />
                          <span>{item.prepTime} mins</span>
                        </div>
                      </div>
                      <div className="mc-right">
                        <span className="mc-price">₹{item.price.toLocaleString('en-IN')}</span>
                        {qty > 0 && (
                          <div className="mc-cart-qty-ctrl">
                            <button onClick={() => removeFromCart(item.id)}><Minus size={11} /></button>
                            <span>{qty}</span>
                            <button onClick={() => addToCart(item)}><Plus size={11} /></button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="mc-divider" />

                    {/* Bottom row: status pill + action icons */}
                    <div className="mc-bottom">
                      <button
                        className={`mc-avail-pill ${item.available ? 'pill-avail' : 'pill-unavail'}`}
                        onClick={() => toggleAvail(item.id)}
                        title="Toggle availability"
                      >
                        {item.available ? 'Available' : 'Unavailable'}
                      </button>

                      <div className="mc-actions">
                      
                        {/* edit */}
                        <button
                          className="mc-action-btn"
                          title="Edit item"
                          onClick={() => editItem(item.id)}
                        >
                          <Edit2 size={17} />
                        </button>

                        {/* delete */}
                        <button
                          className="mc-action-btn mc-btn-delete"
                          title="Delete item"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 size={17} />
                        </button>

                        {/* add to cart */}
                        {item.available && qty === 0 && (
                          <button
                            className={`mc-add-btn ${flashId === item.id ? 'flash' : ''}`}
                            onClick={() => addToCart(item)}
                          >
                            {flashId === item.id ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}