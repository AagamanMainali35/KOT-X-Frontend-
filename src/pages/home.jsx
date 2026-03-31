import React, { useState, useEffect } from 'react';  
import { Home, ShoppingCart, Receipt, Circle, Users, HandPlatter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OrderSummary from '../component/OrderSummary/OrderSummarys';
import '../assets/css/kitchen-dashboard.css';
import Sidebar from '../component/Sidebar/Sidebars';
import { useTables } from '../context/TablesContext';
import { useOrder } from '../context/OrderContext';

const Dashboard = () => {
  const Backend = import.meta.env.VITE_BACKEND; 
  const navigate = useNavigate();
  const { selectedTable, setSelectedTable } = useTables();
  const { orderItems, addItem, updateQuantity, removeItem, clearOrder } = useOrder();

  const [tables, setTables] = useState(null); // 🔥 changed
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('home');
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    const startTime = Date.now();

    fetch(`${Backend}Tables/all/`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setTables(data);
        setError(false);
      })
      .catch(() => {
        setTables([]); // empty = fallback trigger
        setError(true);
      })
      .finally(() => {
        const elapsed = Date.now() - startTime;
        const minDelay = 0;
        const delay = elapsed < minDelay ? minDelay - elapsed : 0;
        setTimeout(() => setLoading(false), delay);
      });
  }, []);

  const handleSelectTable = (table) => {
    if (selectedTable?.id === table.id) {
      clearOrder();
      setSelectedTable(null);
      return;
    }

    setSelectedTable(table);

    if (table.status === 'occupied') {
      fetch(`${Backend}Order/${table.id}/`)
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(data => {
          clearOrder();
          console.log(JSON.stringify(data,null,3))
          const formatted = data.Items.map(item => ({
            id: item.OrderItemID,
            name: item.Item.item_name,
            price: item.Item.price,
            quantity: item.quantity,
            image: item.Item.image,
            special_note: item.special_note
          }));
          formatted.forEach(item => addItem(item));
        })
        .catch(() => clearOrder());
    } else {
      clearOrder();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#22c55e';
      case 'occupied': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const getStatusLabel = (status) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  const calculateTotal = () => {
    const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    return subtotal + subtotal * 0.13;
  };

  const stats = [
    { label: 'Current Table', value: selectedTable?.table_name || 'Not Selected', icon: Home, color: '#3b82f6' },
    { label: 'Items in Order', value: orderItems.reduce((s, i) => s + i.quantity, 0), icon: ShoppingCart, color: '#8b5cf6' },
    { label: 'Order Total', value: `$${calculateTotal().toFixed(2)}`, icon: Receipt, color: '#22c55e' }
  ];

  const showFallback = !loading && (error || (tables && tables.length === 0));

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <main className="main-content">
        <div className="dashboard">
          <h1 className="page-title">Dashboard</h1>

          {/* Stats */}
          <div className="stats-grid">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                    <Icon size={24} color="#fff" />
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">{stat.label}</p>
                    <h2 className="stat-value">{stat.value}</h2>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dashboard Grid */}
          <div className={`dashboard-grid ${!selectedTable ? 'no-order' : ''}`}>

            {/* 🔥 LOADING → SKELETON */}
            {loading ? (
              <div className="table-selection-container">
                <div className="tables-grid">
                  {Array(8).fill(0).map((_, i) => (
                    <div key={i} className="table-card skeleton"></div>
                  ))}
                </div>
              </div>

            ) : showFallback ? (

              /* 🔥 FALLBACK ONLY AFTER LOADING */
              <div className="fallback-ui standalone">
                <HandPlatter size={64} />
                <h2>No Tables Available</h2>
                <p>Create one to start taking orders</p>
                <button className="create-table-btn" onClick={() => navigate('/create-table')}>
                  + Create Table
                </button>
              </div>

            ) : (

              /* 🔥 ACTUAL TABLES */
              <div className="table-selection-container">
                <div className="table-selection-header">
                  <h3 className="section-title">Select Table</h3>
                  <div className="table-status-legend">
                    <div className="legend-item"><Circle size={12} fill="#22c55e" /><span>Available</span></div>
                    <div className="legend-item"><Circle size={12} fill="#ef4444" /><span>Occupied</span></div>
                    <div className="legend-item"><Circle size={12} fill="#f59e0b" /><span>Reserved</span></div>
                  </div>
                </div>

                <div className="tables-grid">
                  {tables.map(table => (
                    <button
                      key={table.id}
                      onClick={() => handleSelectTable(table)}
                      className={`table-card ${selectedTable?.id === table.id ? 'selected' : ''} ${table.status}`}
                    >
                      <div className="table-card-header">
                        <div className="status-dot" style={{ backgroundColor: getStatusColor(table.status) }} />
                        <span className="status-label">{getStatusLabel(table.status)}</span>
                      </div>

                      <div className="table-card-body">
                        <h4 className="table-name">{table.table_name}</h4>
                        <div className="table-capacity">
                          <Users size={16} />
                          <span>{table.capacity} seats</span>
                        </div>
                      </div>

                      {selectedTable?.id === table.id && (
                        <div className="selected-badge">Selected</div>
                      )}
                    </button>
                  ))}
                </div>

                {selectedTable && (
                  <div className="selected-table-info">
                    <p>✓ Currently selected: <strong>{selectedTable.table_name}</strong></p>
                  </div>
                )}
              </div>
            )}

            {/* Order Summary */}
            {selectedTable && (
              <OrderSummary
                orderItems={orderItems}
                tableNumber={selectedTable.table_name}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                onClearOrder={clearOrder}
                onSubmitOrder={() => alert(`Order submitted for ${selectedTable.table_name}`)}
              />
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;