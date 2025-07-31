import { useMemo } from 'react';
import { PRODUCTS } from '@/lib/products';
//import { CartItem } from '../types';
interface CartItem {
  id: string;
  quantity: number;
}
export const useCalculations = (cartItems: CartItem[]) => {
  return useMemo(() => {
    let subtotal = 0;
    let totalAmount = 0;
    let totalSaved = 0;
    let itemCount = 0;

    cartItems.forEach((item) => {
      const product = PRODUCTS.find((p) => p.id === item.id);
      if (product) {
        const originalPrice = product.price * item.quantity;
        const currentPrice = (product.onSale ? product.discountPrice : product.price) * item.quantity;

        subtotal += originalPrice;
        totalAmount += currentPrice;
        totalSaved += originalPrice - currentPrice;
        itemCount += item.quantity;
      }
    });

    // 화요일 할인 (10%)
    const today = new Date();
    const isTuesday = today.getDay() === 2;
    if (isTuesday && totalAmount > 0) {
      const tuesdayDiscount = totalAmount * 0.1;
      totalAmount -= tuesdayDiscount;
      totalSaved += tuesdayDiscount;
    }

    // 대량 구매 할인 (30개 이상시 25% 할인)
    if (itemCount >= 30) {
      const bulkDiscount = totalAmount * 0.25;
      totalAmount -= bulkDiscount;
      totalSaved += bulkDiscount;
    }

    return {
      subtotal,
      totalAmount,
      totalSaved,
      itemCount,
      discountRate: subtotal > 0 ? totalSaved / subtotal : 0,
      isTuesday,
      hasBulkDiscount: itemCount >= 30,
    };
  }, [cartItems]);
};
