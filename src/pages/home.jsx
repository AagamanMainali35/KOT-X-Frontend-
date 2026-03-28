import React, { useState,useEffect} from 'react';
import { Home, ShoppingCart, Receipt, Circle, Users } from 'lucide-react';
import OrderSummary from '../component/OrderSummary/OrderSummarys';
import '../assets/css/kitchen-dashboard.css';
import Sidebar from '../component/Sidebar/Sidebars'

const Dashboard = () => {
  const Backend = import.meta.env.VITE_BACKEND;
  const [tables, setTables] = useState([]);
  const [activeView, setActiveView] = useState('home');
  const [tableNumber, setTableNumber] = useState('');
  const [orderItems, setOrderItems] = useState([
    // { id: 1, name: 'Grilled Salmon', price: 24.99, quantity: 2 },
    // { id: 2, name: 'Pasta Carbonara', price: 18.99, quantity: 1 },
    // { id: 3, name: 'Margherita Pizza', price: 16.99, quantity: 1 }
  ]);


  useEffect(() => {
  fetch(`${Backend}Tables/all/`, { method: 'GET' })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
     setTables(data);    
    })
    .catch(err => console.error("Fetch error:", err));
}, []);


  // Order Management Functions
  const handleUpdateQuantity = (itemId, newQuantity) => {
    setOrderItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );

    //NOTE: Add a featch call to update the Qunatity

  };

  const handleRemoveItem = (itemId) => {
    setOrderItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const handleClearOrder = () => {
    if (window.confirm('Are you sure you want to clear the entire order?')) {
      setOrderItems([]);
      setTableNumber('');
    }
  };

  const handleSubmitOrder = () => {
    if (!tableNumber) {
      alert('Please select a table first!');
      return;
    }
    if (orderItems.length === 0) {
      alert('Please add items to the order first!');
      return;
    }
    alert(`Order submitted for ${tableNumber}!\nTotal Items: ${orderItems.reduce((sum, item) => sum + item.quantity, 0)}`);
  };

  const handleSelectTable = (tableName, status, table_id) => {
  // If clicking the currently selected table, unselect it
  if (tableNumber === tableName) {
    setTableNumber('');
    setOrderItems([]);
    return;
  }

  setTableNumber(tableName);
  if (status === 'occupied') {
    fetch(`${Backend}Order/${table_id}/`) 
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log(data)
        const formattedItems = data.Items.map(item => ({
          id: item.OrderItemID,
          name: item.Item.item_name,
          price: item.Item.price,
          quantity: item.quantity,
          image: item.Item.image,
          special_note: item.special_note
        }));
        setOrderItems(formattedItems);
      })
      .catch(err => console.error("Fetch order error:", err));
  } else {
    setOrderItems([]);
  }
};

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return '#22c55e';
      case 'occupied':
        return '#ef4444';
      default:
        return '#94a3b8';
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Calculate stats
  const calculateTotal = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vat = subtotal * 0.13;
    return subtotal + vat;
  };

  const stats = [
    {
      label: 'Current Table',
      value: tableNumber || 'Not Selected',
      icon: Home,
      color: '#3b82f6'
    },
    {
      label: 'Items in Order',
      value: orderItems.reduce((sum, item) => sum + item.quantity, 0),
      icon: ShoppingCart,
      color: '#8b5cf6'
    },
    {
      label: 'Order Total',
      value: `$${calculateTotal().toFixed(2)}`,
      icon: Receipt,
      color: '#22c55e'
    }
  ];

  return (
    <div className="app-container">
      {/* Sidebar Component */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Main Content */}
      <main className="main-content">
        <div className="dashboard">
          <h1 className="page-title">Dashboard</h1>
          
          {/* Stats Cards */}
          <div className="stats-grid">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="stat-card">
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
          <div className="dashboard-grid">
            {/* Table Selection */}
            <div className="table-selection-container">
              <div className="table-selection-header">
                <h3 className="section-title">Select Table</h3>
                <div className="table-status-legend">
                  <div className="legend-item">
                    <Circle size={12} fill="#22c55e" color="#22c55e" />
                    <span>Available</span>
                  </div>
                  <div className="legend-item">
                    <Circle size={12} fill="#ef4444" color="#ef4444" />
                    <span>Occupied</span>
                  </div>
                  <div className="legend-item">
                    <Circle size={12} fill="#f59e0b" color="#f59e0b" />
                    <span>Reserved</span>
                  </div>
                </div>
              </div>

              <div className="tables-grid">
                {tables.map(table => (
                  <button
                    key={table.id}
                    onClick={() => handleSelectTable(table.table_name, table.status,table.id)}
                    className={`table-card ${tableNumber === table.table_name ? 'selected' : ''} ${table.status}`}
                    // disabled={table.status !== 'available'}
                  >
                    <div className="table-card-header">
                      <div 
                        className="status-dot" 
                        style={{ backgroundColor: getStatusColor(table.status) }}
                      />
                      <span className="status-label">{getStatusLabel(table.status)}</span>
                    </div>
                    
                    <div className="table-card-body">
                      <h4 className="table-name">{table.table_name}</h4>
                      <div className="table-capacity">
                        <Users size={16} />
                        <span>{table.capacity} seats</span>
                      </div>
                    </div>

                    {tableNumber === table.table_name && (
                      <div className="selected-badge">Selected</div>
                    )}
                  </button>
                ))}
              </div>

              {tableNumber && (
                <div className="selected-table-info">
                  <p>✓ Currently selected: <strong>{tableNumber}</strong></p>
                </div>
              )}
            </div>

            {/* Order Summary Component */}
            <OrderSummary
              orderItems={orderItems}
              tableNumber={tableNumber}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearOrder={handleClearOrder}
              onSubmitOrder={handleSubmitOrder}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;