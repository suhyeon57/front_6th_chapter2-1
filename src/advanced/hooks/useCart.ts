import { useState, useCallback, useMemo } from 'react';
import { PRODUCTS } from '@/lib/products';

// // 타입 정의 (실제 products 구조에 맞춤)
// interface Product {
//   id: string;
//   name: string;
//   discountPrice: number;
//   price: number;
//   quantity: number;
//   onSale: boolean;
//   suggestSale: boolean;
//   discountRate: number;
// }

interface CartItem {
  id: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  lastSelected: string | null;
}

export const useCart = () => {
  // 1️⃣ 상태 정의
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastSelected, setLastSelected] = useState<string | null>(null);

  // 2️⃣ 계산된 값들 - 실제 products 구조로 계산
  const itemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const totalAmount = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const product = PRODUCTS.find((p) => p.id === item.id);
      if (!product) return total;

      // 할인 가격 사용 (onSale이면 discountPrice, 아니면 price)
      const currentPrice = product.onSale ? product.discountPrice : product.price;
      return total + currentPrice * item.quantity;
    }, 0);
  }, [cartItems]);

  // 3️⃣ 액션 함수들
  const addItem = useCallback((productId: string) => {
    // 상품 존재 여부 및 재고 확인
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) {
      console.warn('상품을 찾을 수 없습니다.');
      return false;
    }

    if (product.quantity <= 0) {
      console.warn('재고가 부족합니다.');
      return false;
    }

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === productId);

      if (existingItem) {
        // 재고 확인
        if (existingItem.quantity >= product.quantity) {
          console.warn('재고가 부족합니다.');
          return prev;
        }

        return prev.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item));
      } else {
        return [...prev, { id: productId, quantity: 1 }];
      }
    });

    setLastSelected(productId);
    return true;
  }, []);

  const updateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
      return;
    }

    // 재고 확인
    const product = PRODUCTS.find((p) => p.id === productId);
    if (product && newQuantity > product.quantity) {
      console.warn('재고가 부족합니다.');
      return;
    }

    setCartItems((prev) => prev.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item)));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setLastSelected(null);
  }, []);

  // 4️⃣ 유틸리티 함수들
  const getCartItemWithProduct = useCallback(() => {
    return cartItems
      .map((item) => {
        const product = PRODUCTS.find((p) => p.id === item.id);
        return product
          ? {
              // product가 존재할 때만 반환
              ...item,
              product,
            }
          : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null); // null 제거 및 타입 가드
  }, [cartItems]);

  // 할인 적용된 총액 계산
  const getDiscountedTotal = useCallback(() => {
    let subtotal = 0;
    let discountedTotal = 0;

    cartItems.forEach((item) => {
      const product = PRODUCTS.find((p) => p.id === item.id);
      if (product) {
        subtotal += product.price * item.quantity;
        const currentPrice = product.onSale ? product.discountPrice : product.price;
        discountedTotal += currentPrice * item.quantity;
      }
    });

    return {
      subtotal,
      discountedTotal,
      savedAmount: subtotal - discountedTotal,
    };
  }, [cartItems]);

  // 5️⃣ 반환할 객체
  const cartState: CartState = {
    items: cartItems,
    totalAmount,
    itemCount,
    lastSelected,
  };

  return {
    // 상태
    cartState,

    // 액션들
    addItem,
    updateQuantity,
    removeItem,
    clearCart,

    // 유틸리티
    getCartItemWithProduct,
    getDiscountedTotal,

    // 개별 상태들 (필요시 사용)
    cartItems,
    itemCount,
    totalAmount,
    lastSelected,
  };
};
