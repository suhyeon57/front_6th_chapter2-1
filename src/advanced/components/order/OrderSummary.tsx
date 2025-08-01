import React from 'react';

// 상수 정의 (바닐라 JS의 constants와 동일)
const DISCOUNT_RATES = {
  ITEM_DISCOUNT_THRESHOLD: 10,
  BULK_DISCOUNT_THRESHOLD: 30,
  BULK_DISCOUNT_RATE: 0.25,
  TUESDAY_DISCOUNT_RATE: 0.1,
  PRODUCT_DISCOUNTS: {
    p1: 0.1, // 버그 없애는 키보드
    p2: 0.1, // 생산성 폭발 마우스
    p3: 0.1, // 거북목 탈출 모니터암
    p4: 0.1, // 코딩할 때 듣는 Lo-Fi 스피커
    p5: 0.1, // 에러 방지 노트북 파우치
  } as { [key: string]: number }, // 타입 추가
};

const POINTS_CONFIG = {
  BASE_POINTS_DIVISOR: 1000,
  TUESDAY_MULTIPLIER: 2,
  COMBO_BONUS: {
    KEYBOARD_MOUSE: 50,
    FULL_SET: 100,
  },
  BULK_BONUS: {
    TIER_1: { min: 10, points: 20 },
    TIER_2: { min: 20, points: 50 },
    TIER_3: { min: 30, points: 100 },
  },
};

const PRODUCT_IDS = {
  KEYBOARD: 'p1',
  MOUSE: 'p2',
  MONITOR_ARM: 'p3',
  SPEAKER: 'p4',
  POUCH: 'p5',
} as const; // const assertion 추가

const DAYS = {
  TUESDAY: 2,
};

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

const OrderSummary: React.FC<OrderSummaryProps> = ({ cartItemsWithProduct }) => {
  // 정확한 장바구니 계산 (바닐라 JS 로직 복제)
  const calculateCartAccurate = () => {
    let subtotal = 0;
    let itemCount = 0;
    let totalAmount = 0;
    const itemDiscounts: Array<{ name: string; discount: number }> = [];

    // 개별 아이템 계산
    cartItemsWithProduct.forEach(({ quantity, product }) => {
      const itemTotal = product.price * quantity;
      itemCount += quantity;
      subtotal += itemTotal;

      // 개별 상품 할인 계산 (타입 안전하게 수정)
      let discount = 0;
      if (quantity >= DISCOUNT_RATES.ITEM_DISCOUNT_THRESHOLD) {
        // 타입 안전한 접근 방법
        const productDiscount =
          DISCOUNT_RATES.PRODUCT_DISCOUNTS[product.id as keyof typeof DISCOUNT_RATES.PRODUCT_DISCOUNTS];
        discount = productDiscount || 0;

        if (discount > 0) {
          itemDiscounts.push({
            name: product.name,
            discount: discount * 100,
          });
        }
      }

      totalAmount += itemTotal * (1 - discount);
    });

    // 대량 구매 할인 적용
    let discountRate = 0;
    let hasBulkDiscount = false;

    if (itemCount >= DISCOUNT_RATES.BULK_DISCOUNT_THRESHOLD) {
      totalAmount = subtotal * (1 - DISCOUNT_RATES.BULK_DISCOUNT_RATE);
      discountRate = DISCOUNT_RATES.BULK_DISCOUNT_RATE;
      hasBulkDiscount = true;
    } else {
      discountRate = subtotal > 0 ? (subtotal - totalAmount) / subtotal : 0;
    }

    // 화요일 특별 할인 적용
    const isTuesday = new Date().getDay() === DAYS.TUESDAY;
    if (isTuesday && totalAmount > 0) {
      totalAmount = totalAmount * (1 - DISCOUNT_RATES.TUESDAY_DISCOUNT_RATE);
      discountRate = 1 - totalAmount / subtotal;
    }

    return {
      subtotal,
      itemCount,
      totalAmount,
      discountRate,
      savedAmount: subtotal - totalAmount,
      itemDiscounts,
      isTuesday,
      hasBulkDiscount,
    };
  };

  // 정확한 보너스 포인트 계산
  const calculateBonusPointsAccurate = () => {
    if (cartItemsWithProduct.length === 0) return { points: 0, detail: [] };

    const { totalAmount: calcTotal, itemCount: calcItemCount } = calculateCartAccurate();
    const basePoints = Math.floor(calcTotal / POINTS_CONFIG.BASE_POINTS_DIVISOR);
    let finalPoints = 0;
    const pointsDetail: string[] = [];

    if (basePoints > 0) {
      finalPoints = basePoints;
      pointsDetail.push(`기본: ${basePoints}p`);
    }

    // 화요일 2배 적립
    const isTuesday = new Date().getDay() === DAYS.TUESDAY;
    if (isTuesday && basePoints > 0) {
      finalPoints = basePoints * POINTS_CONFIG.TUESDAY_MULTIPLIER;
      pointsDetail.push('화요일 2배');
    }

    // 상품 조합별 보너스 포인트 체크
    let hasKeyboard = false;
    let hasMouse = false;
    let hasMonitorArm = false;

    cartItemsWithProduct.forEach(({ product }) => {
      if (product.id === PRODUCT_IDS.KEYBOARD) {
        hasKeyboard = true;
      } else if (product.id === PRODUCT_IDS.MOUSE) {
        hasMouse = true;
      } else if (product.id === PRODUCT_IDS.MONITOR_ARM) {
        hasMonitorArm = true;
      }
    });

    // 키보드 + 마우스 세트 보너스
    if (hasKeyboard && hasMouse) {
      finalPoints += POINTS_CONFIG.COMBO_BONUS.KEYBOARD_MOUSE;
      pointsDetail.push('키보드+마우스 세트 +50p');
    }

    // 풀세트 구매 보너스
    if (hasKeyboard && hasMouse && hasMonitorArm) {
      finalPoints += POINTS_CONFIG.COMBO_BONUS.FULL_SET;
      pointsDetail.push('풀세트 구매 +100p');
    }

    // 대량 구매 보너스
    if (calcItemCount >= POINTS_CONFIG.BULK_BONUS.TIER_3.min) {
      finalPoints += POINTS_CONFIG.BULK_BONUS.TIER_3.points;
      pointsDetail.push('대량구매(30개+) +100p');
    } else if (calcItemCount >= POINTS_CONFIG.BULK_BONUS.TIER_2.min) {
      finalPoints += POINTS_CONFIG.BULK_BONUS.TIER_2.points;
      pointsDetail.push('대량구매(20개+) +50p');
    } else if (calcItemCount >= POINTS_CONFIG.BULK_BONUS.TIER_1.min) {
      finalPoints += POINTS_CONFIG.BULK_BONUS.TIER_1.points;
      pointsDetail.push('대량구매(10개+) +20p');
    }

    return {
      points: finalPoints,
      detail: pointsDetail,
    };
  };

  // ... 나머지 코드는 동일 ...

  const accurateCalculations = calculateCartAccurate();
  const pointsData = calculateBonusPointsAccurate();

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

  // 할인 목록 생성 (정확한 로직)
  const createDiscountList = () => {
    const discounts = [];

    // 대량 구매 할인
    if (accurateCalculations.hasBulkDiscount) {
      discounts.push(
        <div key="bulk" className="flex justify-between text-sm tracking-wide text-green-400">
          <span className="text-xs">🎉 대량구매 할인 (30개 이상)</span>
          <span className="text-xs">-25%</span>
        </div>
      );
    } else {
      // 개별 상품 할인 (10개 이상)
      accurateCalculations.itemDiscounts.forEach((item, index) => {
        discounts.push(
          <div key={`discount-${index}`} className="flex justify-between text-sm tracking-wide text-green-400">
            <span className="text-xs">{item.name} (10개↑)</span>
            <span className="text-xs">-{item.discount}%</span>
          </div>
        );
      });
    }

    // 화요일 할인
    if (accurateCalculations.isTuesday && accurateCalculations.totalAmount > 0) {
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

  return (
    <div className="bg-black text-white p-8 flex flex-col">
      <h2 className="text-xs font-medium mb-5 tracking-extra-wide uppercase">Order Summary</h2>

      <div className="flex-1 flex flex-col">
        {/* 주문 상세 */}
        <div id="summary-details" className="space-y-3">
          {cartItemsWithProduct.length === 0 ? (
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
                <span>₩{accurateCalculations.subtotal.toLocaleString()}</span>
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
            {accurateCalculations.discountRate > 0 && accurateCalculations.totalAmount > 0 && (
              <div className="bg-green-500/20 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
                  <span className="text-sm font-medium text-green-400">
                    {(accurateCalculations.discountRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-2xs text-gray-300">
                  ₩{Math.round(accurateCalculations.savedAmount).toLocaleString()} 할인되었습니다
                </div>
              </div>
            )}
          </div>

          {/* 총액 */}
          <div id="cart-total" className="pt-5 border-t border-white/10">
            <div className="flex justify-between items-baseline">
              <span className="text-sm uppercase tracking-wider">Total</span>
              <div className="text-2xl tracking-tight">
                ₩{Math.round(accurateCalculations.totalAmount).toLocaleString()}
              </div>
            </div>

            {/* 아이템 수량 */}
            <div id="item-count" className="text-center text-sm text-gray-400 mt-2">
              {accurateCalculations.itemCount > 0 ? `총 ${accurateCalculations.itemCount}개의 상품` : ''}
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
              accurateCalculations.isTuesday && accurateCalculations.totalAmount > 0 ? 'block' : 'hidden'
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
