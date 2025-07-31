import React from 'react';
import ProductPicker from './ProductPicker';

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

// Props 타입 정의
interface Product {
  id: string;
  name: string;
  discountPrice: number;
  price: number;
  quantity: number;
  onSale: boolean;
  suggestSale: boolean;
  discountRate: number;
}

interface ShoppingCartProps {
  products: Product[];
  cartState: CartState;
  onAddItem: (productId: string) => void;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
  products,
  cartState,
  onAddItem,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  // 장바구니 아이템과 상품 정보 결합
  const cartItemsWithProduct = cartState.items
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      return {
        ...item,
        product: product!,
      };
    })
    .filter((item) => item.product); // product가 없는 경우 제외

  return (
    <div className="bg-white border border-gray-200 p-8 overflow-y-auto">
      {/* 상품 선택기 */}
      <ProductPicker products={products} onAddItem={onAddItem} />

      {/* 장바구니 아이템들 */}
      <div id="cart-items">
        {cartItemsWithProduct.length === 0 ? (
          // 빈 장바구니 상태
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">장바구니가 비어있습니다</p>
            <p className="text-sm">상품을 선택해주세요</p>
          </div>
        ) : (
          // 장바구니 아이템들 렌더링
          cartItemsWithProduct.map(({ id, quantity, product }) => (
            <div
              key={id}
              className="grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0"
            >
              {/* 상품 이미지 */}
              <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-gray-700 relative overflow-hidden rounded">
                <div className="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45" />
                {/* 할인 뱃지 */}
                {product.onSale && (
                  <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded">SALE</div>
                )}
                {product.suggestSale && (
                  <div className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                    추천
                  </div>
                )}
              </div>

              {/* 상품 정보 */}
              <div>
                <h3 className="text-base font-normal mb-1 tracking-tight">{product.name}</h3>
                <p className="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
                <p className="text-xs text-black mb-3">₩{product.price.toLocaleString()}</p>

                {/* 수량 조절 버튼들 */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onUpdateQuantity(id, quantity - 1)}
                    className="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="min-w-[20px] text-center">{quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(id, quantity + 1)}
                    className="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white"
                    disabled={quantity >= product.quantity} // 재고 제한
                  >
                    +
                  </button>
                </div>

                {/* 재고 부족 경고 */}
                {quantity >= product.quantity && <p className="text-xs text-red-500 mt-1">재고 부족</p>}
              </div>

              {/* 가격 및 삭제 버튼 */}
              <div className="text-right">
                <div className="text-lg mb-2 tracking-tight tabular-nums">
                  {product.onSale ? (
                    // 할인가 표시
                    <>
                      <span className="line-through text-gray-400">₩{(product.price * quantity).toLocaleString()}</span>{' '}
                      <span className="text-purple-600">₩{(product.discountPrice * quantity).toLocaleString()}</span>
                    </>
                  ) : (
                    // 정가 표시
                    <span className="text-black">₩{(product.price * quantity).toLocaleString()}</span>
                  )}
                </div>

                {/* 할인율 표시 */}
                {product.onSale && (
                  <div className="text-xs text-green-600 mb-2">
                    {Math.round((1 - product.discountPrice / product.price) * 100)}% 할인
                  </div>
                )}

                {/* 삭제 버튼 */}
                <button
                  onClick={() => onRemoveItem(id)}
                  className="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black bg-transparent border-none p-0"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 장바구니 요약 */}
      {cartItemsWithProduct.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
            <span>총 {cartState.itemCount}개 상품</span>
            <span>₩{cartState.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
