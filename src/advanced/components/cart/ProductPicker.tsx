import React, { useState } from 'react';
import { PRODUCTS } from '../../lib/products';

// 상수 정의 (바닐라 JS의 constants와 동일)
const STOCK_CONFIG = {
  LOW_STOCK_THRESHOLD: 5,
};

interface ProductPickerProps {
  onAddItem: (productId: string) => void;
}

const ProductPicker: React.FC<ProductPickerProps> = ({ onAddItem }) => {
  // 버그 없애는 키보드의 ID를 직접 설정
  const [selectedProductId, setSelectedProductId] = useState<string>('p1');

  const handleAddToCart = () => {
    if (selectedProductId) {
      onAddItem(selectedProductId);
      // 선택 유지 (초기화하지 않음)
    }
  };

  // 재고 메시지 생성 - 바닐라 JS 로직 정확히 복제
  const generateStockMessage = (): string => {
    let stockMsg = '';

    for (let i = 0; i < PRODUCTS.length; i++) {
      const item = PRODUCTS[i];

      // item.q 대신 item.quantity 사용 (React 버전에서는 quantity 필드)
      if (item.quantity < STOCK_CONFIG.LOW_STOCK_THRESHOLD) {
        if (item.quantity > 0) {
          stockMsg += item.name + ': 재고 부족 (' + item.quantity + '개 남음)\n';
        } else {
          stockMsg += item.name + ': 품절\n';
        }
      }
    }

    return stockMsg;
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
        {generateStockMessage()}
      </div>
    </div>
  );
};

export default ProductPicker;
