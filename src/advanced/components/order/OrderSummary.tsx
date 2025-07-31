import React from 'react';

// 타입 정의
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

interface CartItemWithProduct extends CartItem {
  product: Product;
}

interface Calculations {
  subtotal: number;
  totalAmount: number;
  totalSaved: number;
  itemCount: number;
  discountRate: number;
  isTuesday: boolean;
  hasBulkDiscount: boolean;
}

interface OrderSummaryProps {
  cartState: CartState;
  cartItemsWithProduct: CartItemWithProduct[];
  calculations: Calculations;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cartState, cartItemsWithProduct, calculations }) => {
  // 보너스 포인트 계산
  const calculateBonusPoints = () => {
    if (cartItemsWithProduct.length === 0) return { points: 0, detail: [] };

    let basePoints = Math.floor(cartState.totalAmount * 0.001); // 기본 0.1%
    let setBonus = 0;
    let fullSetBonus = 0;
    const detail = [`기본: ${basePoints}p`];

    // 키보드+마우스 세트 체크
    const hasKeyboard = cartItemsWithProduct.some((item) => item.product.name.includes('키보드'));
    const hasMouse = cartItemsWithProduct.some((item) => item.product.name.includes('마우스'));

    if (hasKeyboard && hasMouse) {
      setBonus = 50;
      detail.push('키보드+마우스 세트 +50p');
    }

    // 풀세트 구매 체크 (4개 이상)
    if (cartItemsWithProduct.length >= 4) {
      fullSetBonus = 100;
      detail.push('풀세트 구매 +100p');
    }

    return {
      points: basePoints + setBonus + fullSetBonus,
      detail,
    };
  };

  // 아이템 목록 생성
  const createItemsList = () => {
    return cartItemsWithProduct.map(({ id, quantity, product }) => (
      <div key={id} className="flex justify-between text-xs tracking-wide text-gray-400">
        <span>
          {product.name} x {quantity}
        </span>
        <span>₩{(product.price * quantity).toLocaleString()}</span>
      </div>
    ));
  };

  // 할인 목록 생성
  const createDiscountList = () => {
    const discounts = [];

    // 대량 구매 할인
    if (calculations.itemCount >= 30) {
      discounts.push(
        <div key="bulk" className="flex justify-between text-sm tracking-wide text-green-400">
          <span className="text-xs">🎉 대량구매 할인 (30개 이상)</span>
          <span className="text-xs">-25%</span>
        </div>
      );
    } else {
      // 개별 상품 할인 (10개 이상)
      cartItemsWithProduct.forEach(({ id, quantity, product }) => {
        if (quantity >= 10) {
          discounts.push(
            <div key={`discount-${id}`} className="flex justify-between text-sm tracking-wide text-green-400">
              <span className="text-xs">{product.name} (10개↑)</span>
              <span className="text-xs">-10%</span>
            </div>
          );
        }
      });
    }

    // 화요일 할인
    if (calculations.isTuesday && calculations.totalAmount > 0) {
      discounts.push(
        <div key="tuesday" className="flex justify-between text-sm tracking-wide text-purple-400">
          <span className="text-xs">🌟 화요일 추가 할인</span>
          <span className="text-xs">-10%</span>
        </div>
      );
    }

    return discounts;
  };

  // 재고 메시지 생성
  const generateStockMessage = () => {
    // PRODUCTS를 직접 import하거나 props로 받아야 하지만,
    // 여기서는 cartItemsWithProduct에서 판단
    const lowStockItems = cartItemsWithProduct.filter((item) => item.product.quantity < 5);

    if (lowStockItems.length > 0) {
      return lowStockItems
        .map(
          (item) =>
            `${item.product.name}: ${item.product.quantity === 0 ? '품절' : `재고 부족 (${item.product.quantity}개 남음)`}`
        )
        .join('\n');
    }

    return '';
  };

  const pointsData = calculateBonusPoints();

  return (
    <div className="bg-black text-white p-8 flex flex-col">
      <h2 className="text-xs font-medium mb-5 tracking-extra-wide uppercase">Order Summary</h2>

      <div className="flex-1 flex flex-col">
        {/* 주문 상세 */}
        <div id="summary-details" className="space-y-3">
          {cartItemsWithProduct.length === 0 ? (
            // 빈 카트일 때는 아무것도 표시하지 않음 (바닐라 JS와 동일)
            <></>
          ) : (
            <>
              {/* 아이템 목록 */}
              {createItemsList()}

              {/* 구분선 */}
              <div className="border-t border-white/10 my-3"></div>

              {/* 소계 */}
              <div className="flex justify-between text-sm tracking-wide">
                <span>Subtotal</span>
                <span>₩{calculations.subtotal.toLocaleString()}</span>
              </div>

              {/* 할인 목록 */}
              {createDiscountList()}

              {/* 배송비 */}
              <div className="flex justify-between text-sm tracking-wide text-gray-400">
                <span>Shipping</span>
                <span>Free</span>
              </div>
            </>
          )}
        </div>

        <div className="mt-auto">
          {/* 할인 정보 */}
          <div id="discount-info" className="mb-4">
            {calculations.discountRate > 0 && calculations.totalAmount > 0 && (
              <div className="bg-green-500/20 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
                  <span className="text-sm font-medium text-green-400">
                    {(calculations.discountRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-2xs text-gray-300">
                  ₩{Math.round(calculations.totalSaved).toLocaleString()} 할인되었습니다
                </div>
              </div>
            )}
          </div>

          {/* 총액 */}
          <div id="cart-total" className="pt-5 border-t border-white/10">
            <div className="flex justify-between items-baseline">
              <span className="text-sm uppercase tracking-wider">Total</span>
              <div className="text-2xl tracking-tight">₩{Math.round(cartState.totalAmount).toLocaleString()}</div>
            </div>

            {/* 아이템 수량 */}
            <div id="item-count" className="text-center text-sm text-gray-400 mt-2">
              {cartState.itemCount > 0 ? `총 ${cartState.itemCount}개의 상품` : ''}
            </div>

            {/* 보너스 포인트 */}
            {cartItemsWithProduct.length > 0 && (
              <div id="loyalty-points" className="text-xs text-blue-400 mt-2 text-right block">
                {pointsData.points > 0 ? (
                  <>
                    <div>
                      적립 포인트: <span className="font-bold">{pointsData.points}p</span>
                    </div>
                    <div className="text-2xs opacity-70 mt-1">{pointsData.detail.join(', ')}</div>
                  </>
                ) : (
                  <div>
                    적립 포인트: <span className="font-bold">0p</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 화요일 특별 할인 */}
          <div
            id="tuesday-special"
            className={`mt-4 p-3 bg-white/10 rounded-lg ${
              calculations.isTuesday && cartState.totalAmount > 0 ? 'block' : 'hidden'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xs">🎉</span>
              <span className="text-xs uppercase tracking-wide">Tuesday Special 10% Applied</span>
            </div>
          </div>

          {/* 재고 상태 */}
          <div id="stock-status" className="text-xs text-red-500 mt-3 whitespace-pre-line">
            {generateStockMessage()}
          </div>
        </div>
      </div>

      {/* 주문 버튼 */}
      <button
        className="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30"
        disabled={cartItemsWithProduct.length === 0}
      >
        Proceed to Checkout
      </button>

      {/* 하단 안내 문구 */}
      <p className="mt-4 text-2xs text-white/60 text-center leading-relaxed">
        Free shipping on all orders.
        <br />
        <span id="points-notice">Earn loyalty points with purchase.</span>
      </p>
    </div>
  );
};

export default OrderSummary;
