import React, { useState } from 'react';
import { PRODUCTS } from '../../lib/products';

interface ProductPickerProps {
  onAddItem: (productId: string) => void;
}

const ProductPicker: React.FC<ProductPickerProps> = ({ onAddItem }) => {
  // 버그 없애는 키보드의 ID를 직접 설정 (products.js 확인 후)
  const [selectedProductId, setSelectedProductId] = useState<string>('p1'); // p1이 버그 없애는 키보드라고 가정

  const handleAddToCart = () => {
    if (selectedProductId) {
      onAddItem(selectedProductId);
      // 추가 후 다시 기본값으로 설정
      setSelectedProductId('p1');
    }
  };

  // 품절 상품들 필터링
  const outOfStockProducts = PRODUCTS.filter((product) => product.quantity === 0);

  // 재고 부족 상품들 (5개 이하)
  const lowStockProducts = PRODUCTS.filter((product) => product.quantity > 0 && product.quantity <= 5);

  // 재고 상태 메시지 생성
  const getStockStatusMessage = (): string => {
    const messages: string[] = []; // 타입 명시적 선언

    if (outOfStockProducts.length > 0) {
      outOfStockProducts.forEach((product) => {
        messages.push(`${product.name}: 품절`);
      });
    }

    if (lowStockProducts.length > 0) {
      lowStockProducts.forEach((product) => {
        messages.push(`${product.name}: 재고 부족 (${product.quantity}개 남음)`);
      });
    }

    return messages.join('\n');
  };

  return (
    <div className="mb-6 pb-6 border-b border-gray-200">
      <select
        id="product-select"
        className="w-full p-3 border border-gray-300 rounded-lg text-base mb-3"
        value={selectedProductId}
        onChange={(e) => setSelectedProductId(e.target.value)}
      >
        <option value="">상품을 선택하세요</option>
        {PRODUCTS.map((product) => (
          <option
            key={product.id}
            value={product.id}
            disabled={product.quantity === 0}
            className={product.quantity === 0 ? 'text-gray-400' : ''}
          >
            {product.name} - {product.price.toLocaleString()}원{product.quantity === 0 && ' (품절)'}
            {product.onSale && ' - 세일!'}
            {product.suggestSale && ' - 추천!'}
          </option>
        ))}
      </select>

      <button
        className="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
        onClick={handleAddToCart}
        disabled={!selectedProductId}
      >
        Add to Cart
      </button>

      <div id="stock-status" className="text-xs text-red-500 mt-3 whitespace-pre-line">
        {getStockStatusMessage()}
      </div>
    </div>
  );
};

export default ProductPicker;
