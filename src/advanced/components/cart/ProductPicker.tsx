import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '../../lib/products';

// 상수 정의 (바닐라 JS의 constants와 동일)
const STOCK_CONFIG = {
  LOW_STOCK_THRESHOLD: 5,
};

// Product 타입 정의
interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  onSale?: boolean;
  suggestSale?: boolean;
}

interface CartItem {
  id: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

interface ProductPickerProps {
  onAddItem: (productId: string) => void;
  cartState: CartState; // 타입 명시
}

const ProductPicker: React.FC<ProductPickerProps> = ({ onAddItem, cartState }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('p1');
  const [currentProducts, setCurrentProducts] = useState<Product[]>(PRODUCTS);

  // 장바구니 상태가 변경될 때마다 재고 업데이트
  useEffect(() => {
    updateStockBasedOnCart();
  }, [cartState]);

  // 장바구니 기반으로 실제 재고 계산
  const updateStockBasedOnCart = () => {
    const updatedProducts = PRODUCTS.map((product: Product) => {
      // 장바구니에서 해당 상품의 수량 찾기
      const cartItem = cartState.items.find((item: CartItem) => item.id === product.id);
      const cartQuantity = cartItem ? cartItem.quantity : 0;

      // 실제 재고 = 원래 재고 - 장바구니 수량
      const actualStock = Math.max(0, product.quantity - cartQuantity);

      return {
        ...product,
        quantity: actualStock,
      };
    });

    setCurrentProducts(updatedProducts);
  };

  const handleAddToCart = () => {
    if (!selectedProductId) return;

    // 재고 검증
    const selectedProduct = currentProducts.find((p: Product) => p.id === selectedProductId);
    if (!selectedProduct) {
      alert('선택된 상품을 찾을 수 없습니다.');
      return;
    }

    if (selectedProduct.quantity <= 0) {
      alert(`${selectedProduct.name}은(는) 품절입니다.`);
      return;
    }

    // 장바구니에 추가
    onAddItem(selectedProductId);

    // 재고 상태 즉시 업데이트
    setTimeout(() => {
      updateStockBasedOnCart();
    }, 0);
  };

  // 재고 메시지 생성 - 실시간 재고 기반
  const generateStockMessage = (): string => {
    let stockMsg = '';

    for (let i = 0; i < currentProducts.length; i++) {
      const item: Product = currentProducts[i]; // 타입 명시
      const stockQuantity = item.quantity;

      if (stockQuantity < STOCK_CONFIG.LOW_STOCK_THRESHOLD) {
        if (stockQuantity > 0) {
          stockMsg += item.name + ': 재고 부족 (' + stockQuantity + '개 남음)\n';
        } else {
          stockMsg += item.name + ': 품절\n';
        }
      }
    }

    return stockMsg;
  };

  const stockMessage = generateStockMessage();

  return (
    <div className="mb-6 pb-6 border-b border-gray-200">
      <select
        id="product-select"
        className="w-full p-3 border border-gray-300 rounded-lg text-base mb-3"
        value={selectedProductId}
        onChange={(e) => setSelectedProductId(e.target.value)}
      >
        <option value="">상품을 선택하세요</option>
        {currentProducts.map((product: Product) => {
          const stockQuantity = product.quantity;
          return (
            <option
              key={product.id}
              value={product.id}
              disabled={stockQuantity === 0}
              className={stockQuantity === 0 ? 'text-gray-400' : ''}
            >
              {product.name} - {product.price.toLocaleString()}원{stockQuantity === 0 && ' (품절)'}
              {stockQuantity > 0 && stockQuantity < STOCK_CONFIG.LOW_STOCK_THRESHOLD && ` (재고: ${stockQuantity}개)`}
              {product.onSale && ' - 세일!'}
              {product.suggestSale && ' - 추천!'}
            </option>
          );
        })}
      </select>

      <button
        className="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
        onClick={handleAddToCart}
        disabled={!selectedProductId}
      >
        Add to Cart
      </button>

      {/* 재고 상태 - 실시간 업데이트 */}
      <div id="stock-status" className="text-xs text-red-500 mt-3 whitespace-pre-line">
        {stockMessage || ''}
      </div>
    </div>
  );
};

export default ProductPicker;
