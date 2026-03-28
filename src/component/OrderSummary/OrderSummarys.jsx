import React, { useState } from 'react';
import { ShoppingCart, Minus, Plus, Trash2, Tag, Receipt } from 'lucide-react';
import './OrderSummary.css';

const OrderSummary = ({ 
  orderItems = [], 
  tableNumber = '',
  onUpdateQuantity,
  onRemoveItem,
  onClearOrder,
  onSubmitOrder 
}) => {
  const [discountPercent, setDiscountPercent] = useState(0);
  const VAT_RATE = 0.13; // 13% VAT

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateVAT = (subtotal) => {
    return subtotal * VAT_RATE;
  };

  const calculateDiscount = (subtotal) => {
    return subtotal * (discountPercent / 100);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const vat = calculateVAT(subtotal);
    const discount = calculateDiscount(subtotal);
    return subtotal + vat - discount;
  };

  const handleIncreaseQuantity = (itemId) => {
    const item = orderItems.find(i => i.id === itemId);
    if (item && onUpdateQuantity) {
      onUpdateQuantity(itemId, item.quantity + 1);
    }
    console.log(itemId)
  };

 const handleDecreaseQuantity = (itemId) => {
  const item = orderItems.find(i => i.id === itemId);
  if (!item) return;

  if (item.quantity === 1) {
    console.log(`Item quantity to update: 0 (removing item)`); // new value is 0
    onRemoveItem(itemId); // delete from cart
    //NOTE: call the delete orderItem here
  } else {
    const newQuantity = item.quantity - 1;
    console.log(`Item quantity to update: ${newQuantity}`);
    onUpdateQuantity(itemId, newQuantity); // update item via API
    //NOTE:call the update item here
  }

  console.log(`Item id to update: ${item.id}`);
};

  const handleDiscountChange = (e) => {
    const value = Math.max(0, Math.min(100, Number(e.target.value)));
    setDiscountPercent(value);
  };

  const subtotal = calculateSubtotal();
  const vat = calculateVAT(subtotal);
  const discount = calculateDiscount(subtotal);
  const total = calculateTotal();

  if (orderItems.length === 0) {
    return (
      <div className="order-summary">
        <h3 className="section-title">Order Summary</h3>
        <div className="empty-order">
          <ShoppingCart size={48} color="#ccc" />
          <p>No items in order</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-summary">
      <div className="order-header">
        <h3 className="section-title">Order Summary</h3>
        {tableNumber && (
          <span className="table-tag">Table {tableNumber}</span>
        )}
      </div>

      <div className="order-items">
        {orderItems.map(item => (
          <div key={item.id} className="order-item">
            <div className="order-item-info">
              <h4 className="order-item-name">{item.name}</h4>
              <p className="order-item-price">${item.price.toFixed(2)}</p>
            </div>
            <div className="order-item-actions">
              <button
                onClick={() => handleDecreaseQuantity(item.id)}
                className="quantity-button"
                title="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="quantity">{item.quantity}</span>
              <button
                onClick={() => handleIncreaseQuantity(item.id)}
                className="quantity-button"
                title="Increase quantity"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={() => onRemoveItem && onRemoveItem(item.id)}
                className="delete-button"
                title="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Discount Section */}
      <div className="discount-section">
        <label className="discount-label">
          <Tag size={16} />
          Discount (%)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={discountPercent}
          onChange={handleDiscountChange}
          className="discount-input"
          placeholder="0"
        />
      </div>

      {/* Billing Summary */}
      <div className="billing-summary">
        <div className="billing-row">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="billing-row">
          <span>VAT ({(VAT_RATE * 100).toFixed(0)}%):</span>
          <span>${vat.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="billing-row discount-row">
            <span>Discount ({discountPercent}%):</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}
        <div className="total-row">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Order Actions */}
      <div className="order-actions">
        <button 
          onClick={onClearOrder} 
          className="clear-button"
          title="Clear all items"
        >
          Clear Order
        </button>
        <button 
          onClick={onSubmitOrder} 
          className="submit-button"
          title="Submit order to kitchen"
        >
          <Receipt size={18} />
          Submit Order
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;