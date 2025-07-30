import { DISCOUNT_RATES, POINTS_CONFIG, STOCK_CONFIG, DAYS, PRODUCT_IDS } from '../utils/constants.js';

// 상품 찾기 헬퍼 함수
function findProductById(products, id) {
  for (let i = 0; i < products.length; i++) {
    if (products[i].id === id) {
      return products[i];
    }
  }
  return null;
}

// 장바구니 계산 메인 함수
function calculateCart(cartItems, products) {
  let subtotal = 0;
  let itemCount = 0;
  let totalAmount = 0;
  const itemDiscounts = [];

  // 개별 아이템 계산
  for (let i = 0; i < cartItems.length; i++) {
    const cartItem = cartItems[i];
    const product = findProductById(products, cartItem.id);

    if (!product) continue;

    const qtyElem = cartItem.querySelector('.quantity-number');
    const quantity = parseInt(qtyElem.textContent);
    const itemTotal = product.val * quantity;

    itemCount += quantity;
    subtotal += itemTotal;

    // 개별 상품 할인 계산 - 상수 사용
    let discount = 0;
    if (quantity >= DISCOUNT_RATES.ITEM_DISCOUNT_THRESHOLD) {
      discount = DISCOUNT_RATES.PRODUCT_DISCOUNTS[product.id] || 0;
      if (discount > 0) {
        itemDiscounts.push({
          name: product.name,
          discount: discount * 100,
        });
      }
    }

    totalAmount += itemTotal * (1 - discount);
  }

  // 대량 구매 할인 적용 - 상수 사용
  let discountRate = 0;
  if (itemCount >= DISCOUNT_RATES.BULK_DISCOUNT_THRESHOLD) {
    totalAmount = subtotal * (1 - DISCOUNT_RATES.BULK_DISCOUNT_RATE);
    discountRate = DISCOUNT_RATES.BULK_DISCOUNT_RATE;
  } else {
    discountRate = (subtotal - totalAmount) / subtotal;
  }

  // 화요일 특별 할인 적용 - 상수 사용
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
  };
}

// 보너스 포인트 계산 - 상수 사용
function calculateBonusPoints(cartItems, products, itemCount, totalAmount) {
  const basePoints = Math.floor(totalAmount / POINTS_CONFIG.BASE_POINTS_DIVISOR);
  let finalPoints = 0;
  const pointsDetail = [];

  if (basePoints > 0) {
    finalPoints = basePoints;
    pointsDetail.push('기본: ' + basePoints + 'p');
  }

  // 화요일 2배 적립 - 상수 사용
  if (new Date().getDay() === DAYS.TUESDAY) {
    if (basePoints > 0) {
      finalPoints = basePoints * POINTS_CONFIG.TUESDAY_MULTIPLIER;
      pointsDetail.push('화요일 2배');
    }
  }

  // 상품 조합별 보너스 포인트 체크 - 상수 사용
  let hasKeyboard = false;
  let hasMouse = false;
  let hasMonitorArm = false;

  for (let i = 0; i < cartItems.length; i++) {
    const product = findProductById(products, cartItems[i].id);
    if (!product) continue;

    if (product.id === PRODUCT_IDS.KEYBOARD) {
      hasKeyboard = true;
    } else if (product.id === PRODUCT_IDS.MOUSE) {
      hasMouse = true;
    } else if (product.id === PRODUCT_IDS.MONITOR_ARM) {
      hasMonitorArm = true;
    }
  }

  // 키보드 + 마우스 세트 보너스 - 상수 사용
  if (hasKeyboard && hasMouse) {
    finalPoints += POINTS_CONFIG.COMBO_BONUS.KEYBOARD_MOUSE;
    pointsDetail.push('키보드+마우스 세트 +50p');
  }

  // 풀세트 구매 보너스 - 상수 사용
  if (hasKeyboard && hasMouse && hasMonitorArm) {
    finalPoints += POINTS_CONFIG.COMBO_BONUS.FULL_SET;
    pointsDetail.push('풀세트 구매 +100p');
  }

  // 대량 구매 보너스 - 상수 사용
  if (itemCount >= POINTS_CONFIG.BULK_BONUS.TIER_3.min) {
    finalPoints += POINTS_CONFIG.BULK_BONUS.TIER_3.points;
    pointsDetail.push('대량구매(30개+) +100p');
  } else if (itemCount >= POINTS_CONFIG.BULK_BONUS.TIER_2.min) {
    finalPoints += POINTS_CONFIG.BULK_BONUS.TIER_2.points;
    pointsDetail.push('대량구매(20개+) +50p');
  } else if (itemCount >= POINTS_CONFIG.BULK_BONUS.TIER_1.min) {
    finalPoints += POINTS_CONFIG.BULK_BONUS.TIER_1.points;
    pointsDetail.push('대량구매(10개+) +20p');
  }

  return {
    points: finalPoints,
    detail: pointsDetail,
  };
}

// 재고 메시지 생성 - 상수 사용
function generateStockMessage(products) {
  let stockMsg = '';
  for (let i = 0; i < products.length; i++) {
    const item = products[i];
    if (item.q < STOCK_CONFIG.LOW_STOCK_THRESHOLD) {
      if (item.q > 0) {
        stockMsg += item.name + ': 재고 부족 (' + item.q + '개 남음)\n';
      } else {
        stockMsg += item.name + ': 품절\n';
      }
    }
  }
  return stockMsg;
}

// 전체 재고 계산
function calculateTotalStock(products) {
  let sum = 0;
  for (let i = 0; i < products.length; i++) {
    sum += products[i].q;
  }
  return sum;
}

export { calculateCart, calculateBonusPoints, generateStockMessage, calculateTotalStock, findProductById };
