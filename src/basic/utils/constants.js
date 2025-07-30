/* 상수를 정의함으로써 코드의 가독성과 유지보수성을 높임 */

// 상품 ID 상수
export const PRODUCT_IDS = {
  KEYBOARD: 'p1',
  MOUSE: 'p2',
  MONITOR_ARM: 'p3',
  WEBCAM: 'p4',
  HEADSET: 'p5',
};

// 할인율 상수
export const DISCOUNT_RATES = {
  ITEM_DISCOUNT_THRESHOLD: 10, // 개별 상품 할인 최소 수량
  BULK_DISCOUNT_THRESHOLD: 30, // 대량 구매 할인 최소 수량
  BULK_DISCOUNT_RATE: 0.25, // 대량 구매 할인율 (25%)
  TUESDAY_DISCOUNT_RATE: 0.1, // 화요일 할인율 (10%)

  // 개별 상품 할인율
  PRODUCT_DISCOUNTS: {
    p1: 0.1, // 10%
    p2: 0.15, // 15%
    p3: 0.2, // 20%
    p4: 0.05, // 5%
    p5: 0.25, // 25%
  },
};

// 포인트 계산 상수
export const POINTS_CONFIG = {
  BASE_POINTS_DIVISOR: 1000, // 1000원당 1포인트
  TUESDAY_MULTIPLIER: 2, // 화요일 2배 적립
  COMBO_BONUS: {
    KEYBOARD_MOUSE: 50, // 키보드+마우스 세트 보너스
    FULL_SET: 100, // 풀세트 구매 보너스
  },
  BULK_BONUS: {
    TIER_1: { min: 10, points: 20 }, // 10개 이상
    TIER_2: { min: 20, points: 50 }, // 20개 이상
    TIER_3: { min: 30, points: 100 }, // 30개 이상
  },
};

// 재고 관련 상수
export const STOCK_CONFIG = {
  LOW_STOCK_THRESHOLD: 5, // 재고 부족 임계값
  WARNING_STOCK_THRESHOLD: 50, // 경고 재고 임계값
  CRITICAL_STOCK_THRESHOLD: 30, // 심각한 재고 부족 임계값
};

// 요일 상수
export const DAYS = {
  TUESDAY: 2,
};
