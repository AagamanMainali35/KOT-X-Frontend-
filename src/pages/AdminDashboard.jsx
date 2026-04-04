import React, { useState } from "react";
import {
  DollarSign, ShoppingCart, LayoutGrid, UtensilsCrossed,
  Clock, TrendingUp,
} from "lucide-react";
import Sidebar from "../component/Sidebar/Sidebars";
import "../assets/css/AdminDashboard.css";

const STAT_CARDS = [
  {
    id: "revenue",
    label: "Total Revenue Today",
    value: "$1,234.56",
    trend: "+12.5%",
    icon: DollarSign,
    iconBg: "#22c55e",
  },
  {
    id: "orders",
    label: "Active Orders",
    value: "23",
    trend: "+5.2%",
    icon: ShoppingCart,
    iconBg: "#3b82f6",
  },
  {
    id: "tables",
    label: "Total Tables",
    value: "20",
    trend: "No change",
    trendNeutral: true,
    icon: LayoutGrid,
    iconBg: "#8b5cf6",
  },
  {
    id: "menu",
    label: "Menu Items",
    value: "13",
    trend: "+3 items",
    icon: UtensilsCrossed,
    iconBg: "#f59e0b",
  },
];

const RECENT_ORDERS = [
  { id: 1, table: "Table 5",  items: 3, time: "5 min ago",  total: "$45.99", status: "PREPARING", statusColor: "#f59e0b" },
  { id: 2, table: "Table 12", items: 2, time: "12 min ago", total: "$32.50", status: "READY",     statusColor: "#3b82f6" },
  { id: 3, table: "Table 8",  items: 5, time: "18 min ago", total: "$78.25", status: "DELIVERED", statusColor: "#22c55e" },
  { id: 4, table: "Table 3",  items: 4, time: "22 min ago", total: "$56.80", status: "PREPARING", statusColor: "#f59e0b" },
];

const TABLE_STATUS = [
  { label: "Available", count: 20, color: "#22c55e" },
  { label: "Occupied",  count: 0,  color: "#ef4444" },
  { label: "Reserved",  count: 0,  color: "#f59e0b" },
];

const TABLE_GRID = Array.from({ length: 12 }, (_, i) => i + 1);

const QUICK_ACTIONS = [
  { label: "Add Menu Item", icon: UtensilsCrossed },
  { label: "Add Table",     icon: LayoutGrid      },
  { label: "View Orders",   icon: ShoppingCart    },
  { label: "View Reports",  icon: TrendingUp      },
];

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState("admin");

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <main className="main-content">
        <div className="admin-dashboard">

          {/* Header */}
          <div className="admin-header">
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Overview of your restaurant operations</p>
          </div>

          {/* Stat Cards */}
          <div className="admin-stats-grid">
            {STAT_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div className="admin-stat-card" key={card.id}>
                  <div className="admin-stat-header">
                    <div className="admin-stat-icon" style={{ background: card.iconBg }}>
                      <Icon size={22} color="#fff" strokeWidth={2} />
                    </div>
                    <span
                      className="admin-stat-trend"
                      style={card.trendNeutral ? { background: "#f1f5f9", color: "#64748b" } : {}}
                    >
                      {card.trend}
                    </span>
                  </div>
                  <p className="admin-stat-label">{card.label}</p>
                  <h2 className="admin-stat-value">{card.value}</h2>
                </div>
              );
            })}
          </div>

          {/* Middle: Recent Orders + Table Status */}
          <div className="admin-content-grid">

            {/* Recent Orders */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Recent Orders</h3>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="orders-list">
                {RECENT_ORDERS.map((order) => (
                  <div className="order-item-admin" key={order.id}>
                    <div className="order-info">
                      <div className="order-table">
                        <LayoutGrid size={16} color="#64748b" />
                        {order.table}
                      </div>
                      <div className="order-details">
                        <span>{order.items} items</span>
                        <span className="order-time">
                          <Clock size={12} />
                          {order.time}
                        </span>
                      </div>
                    </div>
                    <div className="order-right">
                      <span className="order-total">{order.total}</span>
                      <span
                        className="order-status"
                        style={{ background: order.statusColor }}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Table Status */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Table Status</h3>
              </div>

              {/* Status rows */}
              <div className="table-status-summary">
                {TABLE_STATUS.map(({ label, count, color }) => (
                  <div className="status-item" key={label}>
                    <span className="status-dot" style={{ background: color }} />
                    <span>{label}</span>
                    <span className="status-count">{count}</span>
                  </div>
                ))}
              </div>

              {/* Table number grid */}
              <div className="table-grid-mini">
                {TABLE_GRID.map((n) => (
                  <div
                    className="mini-table"
                    key={n}
                    style={{ background: "#dcfce7", color: "#166534" }}
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Quick Actions */}
          <div className="admin-card">
            <div className="admin-card-header" style={{ borderBottom: "none", marginBottom: 0, paddingBottom: 0 }}>
              <h3>Quick Actions</h3>
            </div>
            <div className="quick-actions" style={{ marginTop: 16 }}>
              {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
                <button className="quick-action-btn" key={label}>
                  <Icon size={18} strokeWidth={1.8} />
                  {label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}