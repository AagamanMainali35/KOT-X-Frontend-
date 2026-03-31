import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Settings, Utensils } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeView }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: Home, path: '/' },
    { id: 'test', label: 'Menu', icon: Utensils, path: '/test' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Utensils size={32} color="#3b82f6" />
        <h2 className="sidebar-title">KOT System</h2>
      </div>

      <nav className="nav">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;