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
  FLASH_SALE_RATE: 0.2, // 번개세일 할인율 (20%)
  SUGGEST_SALE_RATE: 0.05, // 추천 할인율 (5%)

  // 개별 상품 할인율
  PRODUCT_DISCOUNTS: {
    [PRODUCT_IDS.KEYBOARD]: 0.1,
    [PRODUCT_IDS.MOUSE]: 0.15,
    [PRODUCT_IDS.MONITOR_ARM]: 0.2,
    [PRODUCT_IDS.WEBCAM]: 0.05,
    [PRODUCT_IDS.HEADSET]: 0.25,
  },
};

// 재고 관련 상수
export const STOCK_CONFIG = {
  LOW_STOCK_THRESHOLD: 5, // 재고 부족 임계값
  WARNING_STOCK_THRESHOLD: 50, // 경고 재고 임계값
  CRITICAL_STOCK_THRESHOLD: 30, // 심각한 재고 부족 임계값
};

// 타이머 설정 상수
export const TIMER_CONFIG = {
  FLASH_SALE_INTERVAL: 30000, // 번개세일 간격 (30초)
  SUGGEST_SALE_INTERVAL: 60000, // 추천 세일 간격 (60초)
  MAX_FLASH_DELAY: 10000, // 최대 번개세일 지연시간
  MAX_SUGGEST_DELAY: 20000, // 최대 추천 세일 지연시간
};

// UI 텍스트 상수
export const UI_TEXT = {
  // 장바구니 관련
  CART_ITEM_COUNT: (count) => `🛍️ ${count} items in cart`,
  POINTS_DISPLAY: (points) => `적립 포인트: ${points}p`,

  // 알림 메시지
  FLASH_SALE_ALERT: (name) => `⚡번개세일! ${name}이(가) 20% 할인 중입니다!`,
  SUGGEST_SALE_ALERT: (name) => `💝 ${name}은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!`,

  // 재고 메시지
  STOCK_LOW: (name, count) => `${name}: 재고 부족 (${count}개 남음)`,
  STOCK_OUT: (name) => `${name}: 품절`,

  // 상품 표시 텍스트
  OUT_OF_STOCK: (name, price, flags) => `${name} - ${price}원 (품절)${flags}`,
  SUPER_SALE: (name, original, current) => `⚡💝${name} - ${original}원 → ${current}원 (25% SUPER SALE!)`,
  FLASH_SALE: (name, original, current) => `⚡${name} - ${original}원 → ${current}원 (20% SALE!)`,
  SUGGEST_SALE: (name, original, current) => `💝${name} - ${original}원 → ${current}원 (5% 추천할인!)`,
  NORMAL_PRICE: (name, price, flags) => `${name} - ${price}원${flags}`,

  // 할인 플래그
  SALE_FLAG: '⚡SALE',
  SUGGEST_FLAG: '💝추천',
};

// CSS 클래스 상수
export const CSS_CLASSES = {
  DISCOUNT: {
    SUPER_SALE: 'text-purple-600 font-bold',
    FLASH_SALE: 'text-red-500 font-bold',
    SUGGEST_SALE: 'text-blue-500 font-bold',
    OUT_OF_STOCK: 'text-gray-400',
  },
  CART_ITEM: 'grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0',
};

// 요일 상수
export const DAYS = {
  TUESDAY: 2,
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
