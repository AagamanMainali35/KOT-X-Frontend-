import React, { useState } from 'react';
import CreateItemModal from '../component/CreateItemModal/CreateItemModal';
import UpdateItemModal from '../component/UpdateItemModal/UpdateItemModal';
import DeleteItemModal from '../component/DeleteItemModal/DeleteItemModal';
import ToastNotification, { ToastContainer, useToast } from '../component/ToastNotification/ToastNotification';

const MenuManagement = () => {
  // Modal statesQW
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Data states
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([
    { id: 1, name: 'Pizza', price: 299, category: 'Food', description: 'Cheesy pizza' },
    { id: 2, name: 'Burger', price: 199, category: 'Food', description: 'Chicken burger' },
    { id: 3, name: 'Coke', price: 99, category: 'Beverage', description: 'Cold drink' },
  ]);

  // Toast hook
  const { toasts, addToast, removeToast } = useToast();

  // CREATE - Button 1
  const handleCreateItem = (newItem) => {
    const itemWithId = {
      ...newItem,
      id: Date.now(),
      price: parseFloat(newItem.price)
    };
    setItems(prev => [...prev, itemWithId]);
    addToast(`${newItem.name} created successfully!`, 'success');
    setIsCreateModalOpen(false);
  };

  // UPDATE - Button 2
  const handleUpdateItem = (updatedData) => {
    const updatedItem = {
      ...selectedItem,
      ...updatedData,
      price: parseFloat(updatedData.price)
    };
    setItems(prev => prev.map(item => 
      item.id === selectedItem.id ? updatedItem : item
    ));
    addToast(`${updatedData.name} updated successfully!`, 'info');
    setIsUpdateModalOpen(false);
    setSelectedItem(null);
  };

  // DELETE - Button 3
  const handleDeleteItem = (itemId) => {
    const deletedItem = items.find(item => item.id === itemId);
    setItems(prev => prev.filter(item => item.id !== itemId));
    addToast(`${deletedItem?.name} deleted successfully!`, 'warning');
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  // Helper functions to open modals
  const openCreateModal = () => setIsCreateModalOpen(true);
  
  const openUpdateModal = () => {
    // For demo, selecting the first item to update
    if (items.length > 0) {
      setSelectedItem(items[0]);
      setIsUpdateModalOpen(true);
    } else {
      addToast('No items to update! Create one first.', 'error');
    }
  };
  
  const openDeleteModal = () => {
    // For demo, selecting the first item to delete
    if (items.length > 0) {
      setSelectedItem(items[0]);
      setIsDeleteModalOpen(true);
    } else {
      addToast('No items to delete! Create one first.', 'error');
    }
  };

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <h1 style={{ marginBottom: '20px', color: '#0f172a' }}>Menu Management</h1>
      
      {/* 4 Different Buttons for 4 Different Components */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '30px' }}>
        {/* Button 1 - Create Modal */}
        <button 
          onClick={openCreateModal}
          style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          📦 Create Item Modal
        </button>

        {/* Button 2 - Update Modal */}
        <button 
          onClick={openUpdateModal}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          ✏️ Update Item Modal
        </button>

        {/* Button 3 - Delete Modal */}
        <button 
          onClick={openDeleteModal}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          🗑️ Delete Item Modal
        </button>

        {/* Button 4 - Toast Notification (demo) */}
        <button 
          onClick={() => addToast('This is a test notification!', 'info')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          🔔 Show Toast Notification
        </button>
      </div>

      {/* Display existing items */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '20px',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#0f172a' }}>Current Items ({items.length})</h3>
        {items.length === 0 ? (
          <p style={{ color: '#64748b' }}>No items yet. Click "Create Item Modal" to add one.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map(item => (
              <li key={item.id} style={{ 
                padding: '12px', 
                borderBottom: '1px solid #e2e8f0',
                marginBottom: '8px'
              }}>
                <strong style={{ color: '#0f172a' }}>{item.name}</strong> - 
                <span style={{ color: '#10b981', fontWeight: '500' }}> ₹{item.price}</span> - 
                <span style={{ 
                  background: '#f1f5f9', 
                  padding: '2px 8px', 
                  borderRadius: '12px',
                  fontSize: '12px',
                  marginLeft: '8px'
                }}>{item.category}</span>
                <p style={{ color: '#64748b', marginTop: '5px', fontSize: '14px' }}>{item.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal Components */}
      <CreateItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateItem}
      />

      <UpdateItemModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleUpdateItem}
        item={selectedItem}
      />

      <DeleteItemModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleDeleteItem}
        item={selectedItem}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default MenuManagement;