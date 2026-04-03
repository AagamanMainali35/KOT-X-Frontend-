import React, { useState } from 'react';
import { ShoppingCart, Minus, Plus, Trash2, Tag, Receipt } from 'lucide-react';
import { useOrder } from '../../context/OrderItemContext'; // <--- import context
import './OrderSummary.css';

const Backend = import.meta.env.VITE_BACKEND;

const OrderSummary = () => {
  const { orderItems, tableNumber, updateQuantity, removeItem, clearOrder } = useOrder(); // <--- context
  const [discountPercent, setDiscountPercent] = useState(0);
  const VAT_RATE = 0.13;

  const calculateSubtotal = () => orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const calculateVAT = (subtotal) => subtotal * VAT_RATE;
  const calculateDiscount = (subtotal) => subtotal * (discountPercent / 100);

  const UpdateItems = (item_id, quantity) => {
    fetch(`${Backend}Order/UpdateItem/${item_id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "quantity": quantity })
    })
      .then(res => { if (!res.ok) throw new Error(`Invalid response ${res.status}`); return res.json() })
      .then(data => console.log(data, "from update"));
  };

  const handleIncreaseQuantity = (itemId) => {
    const item = orderItems.find(i => i.id === itemId);
    if (item) {
      const newQuantity = item.quantity + 1;
      updateQuantity(itemId, newQuantity);
      UpdateItems(itemId, newQuantity);
    }
  };

  const handleDecreaseQuantity = (itemId) => {
    const item = orderItems.find(i => i.id === itemId);
    if (!item) return;
    if (item.quantity === 1) {
      removeItem(itemId);
    } else {
      const newQuantity = item.quantity - 1;
      updateQuantity(itemId, newQuantity);
      UpdateItems(itemId, newQuantity);
    }
  };

  const handleDiscountChange = (e) => {
    const value = Math.max(0, Math.min(100, Number(e.target.value)));
    setDiscountPercent(value);
  };

  const subtotal = calculateSubtotal();
  const vat = calculateVAT(subtotal);
  const discount = calculateDiscount(subtotal);
  const total = subtotal + vat - discount;

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
        {tableNumber && <span className="table-tag">Table {tableNumber.table_name}</span>}
      </div>

      <div className="order-items">
        {orderItems.map(item => (
          <div key={item.id} className="order-item">
            <div className="order-item-info">
              <h4 className="order-item-name">{item.name}</h4>
              <p className="order-item-price">${item.price.toFixed(2)}</p>
            </div>
            <div className="order-item-actions">
              <button onClick={() => handleDecreaseQuantity(item.id)} className="quantity-button" title="Decrease quantity">
                <Minus size={14} />
              </button>
              <span className="quantity">{item.quantity}</span>
              <button onClick={() => handleIncreaseQuantity(item.id)} className="quantity-button" title="Increase quantity">
                <Plus size={14} />
              </button>
              <button onClick={() => removeItem(item.id)} className="delete-button" title="Remove item">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

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

      <div className="order-actions">
        <button onClick={clearOrder} className="clear-button" title="Clear all items">
          Clear Order
        </button>
        <button onClick={() => alert(`Order submitted for ${tableNumber.table_name}`)} className="submit-button" title="Submit order to kitchen">
          <Receipt size={18} />
          Submit Order
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;