import { createContext, useContext, useState } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { showToast } = useToast();
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || []; }
    catch { return []; }
  });

  const save = (newItems) => {
    setItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
  };

  // addItem(product, variant, qty) — qty mặc định 1
  const addItem = (product, variant, qty = 1) => {
    if (!variant) return;
    const key = variant._id;
    const existing = items.find((i) => i.variantId === key);
    const price = variant.salePrice || variant.price;

    if (existing) {
      save(items.map((i) => i.variantId === key ? { ...i, quantity: i.quantity + qty } : i));
    } else {
      save([...items, {
        variantId: key,
        productId: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0] || '',
        color: variant.color,
        storage: variant.storage,
        price,
        quantity: qty,
      }]);
    }

    showToast({
      message: `Đã thêm "${product.name}" vào giỏ hàng`,
      type: 'success',
      image: product.images?.[0] || null,
    });
  };

  const removeItem = (variantId) => save(items.filter((i) => i.variantId !== variantId));

  const updateQty = (variantId, quantity) => {
    if (quantity < 1) return removeItem(variantId);
    save(items.map((i) => i.variantId === variantId ? { ...i, quantity } : i));
  };

  const clearCart = () => save([]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
