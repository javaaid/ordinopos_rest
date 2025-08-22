import React from "react";
import { usePOS } from "./AppContext"; // adjust path if needed

const OrderSummary: React.FC = () => {
  const {
    cartItems,
    clearCart,
    handleSendToKitchen,
    handleInitiatePayment,
  } = usePOS();

  // Totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  return (
    <div className="order-summary p-4 bg-white rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-3">Order Summary</h2>

      {/* Cart Items */}
      {cartItems.length === 0 ? (
        <p className="text-gray-500">No items in cart</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {cartItems.map((item, index) => (
            <li key={index} className="flex justify-between py-2">
              <span>
                {item.product.name} × {item.qty}
              </span>
              <span>{(item.product.price * item.qty).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Totals */}
      <div className="mt-4 text-right space-y-1">
        <div>Subtotal: {subtotal.toFixed(2)}</div>
        <div>Tax: {tax.toFixed(2)}</div>
        <div className="font-bold">Total: {total.toFixed(2)}</div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleSendToKitchen}
          disabled={!cartItems.length}
          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
        >
          Send to Kitchen
        </button>

        <button
          onClick={handleInitiatePayment}
          disabled={!cartItems.length}
          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700"
        >
          Payment
        </button>
      </div>

      {/* Clear Cart */}
      <div className="mt-2">
        <button
          onClick={clearCart}
          disabled={!cartItems.length}
          className="w-full bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300"
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;
