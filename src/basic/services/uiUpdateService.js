import { generateStockMessage, calculateTotalStock, calculateBonusPoints } from './calculator.js';
import { UI_TEXT, STOCK_CONFIG } from '../utils/constants.js';

// 메인 UI 업데이트 함수
function updateAllUI(cartItems, calculations, cartState, products) {
  updateCartDisplay(calculations, cartState);
  updateSummarySection(cartItems, calculations, products);
  updateDiscountSection(calculations, cartState);
  updateStockSection(products);
  updateVisualEffects(cartItems);
  updateBonusPoints(cartItems, products, cartState);
}

// 장바구니 기본 표시 업데이트
function updateCartDisplay(calculations, cartState) {
  updateItemCountDisplay(cartState.itemCnt);
  updateCartTotal(cartState.totalAmt);
}

// 주문 요약 섹션 업데이트
function updateSummarySection(cartItems, calculations, products) {
  updateSummaryDetails(cartItems, calculations, products);
}

// 할인 섹션 업데이트
function updateDiscountSection(calculations, cartState) {
  updateDiscountInfo(calculations);
  updateTuesdaySpecialDisplay(calculations.isTuesday, cartState.totalAmt);
}

// 재고 섹션 업데이트
function updateStockSection(products) {
  updateStockInfo(products);
  handleStockInfoUpdate(products);
}

// 시각적 효과 업데이트
function updateVisualEffects(cartItems) {
  applyVisualEffects(cartItems);
}

// 보너스 포인트 업데이트
function updateBonusPoints(cartItems, products, cartState) {
  renderBonusPoints(cartItems, products, cartState);
}

// === 개별 UI 업데이트 함수들 ===

// 아이템 수량 표시 업데이트 - 상수 적용
function updateItemCountDisplay(itemCount) {
  document.getElementById('item-count').textContent = UI_TEXT.CART_ITEM_COUNT(itemCount);
}

// 장바구니 총액 표시 업데이트
function updateCartTotal(totalAmount) {
  const cartTotal = document.getElementById('cart-total');
  const totalDiv = cartTotal.querySelector('.text-2xl');
  if (totalDiv) {
    totalDiv.textContent = `₩${Math.round(totalAmount).toLocaleString()}`;
  }
}

// 주문 요약 상세 내역 업데이트
function updateSummaryDetails(cartItems, calculations, products) {
  const summaryDetails = document.getElementById('summary-details');
  summaryDetails.innerHTML = '';

  if (calculations.subtotal <= 0) return;

  // 개별 아이템 표시
  renderIndividualItems(summaryDetails, cartItems, products);

  // 소계 표시
  renderSubtotal(summaryDetails, calculations.subtotal);

  // 할인 정보 표시
  renderDiscountDetails(summaryDetails, calculations);

  // 배송비 정보 표시
  renderShippingInfo(summaryDetails);
}

// 개별 아이템 렌더링
function renderIndividualItems(container, cartItems, products) {
  for (let i = 0; i < cartItems.length; i++) {
    const product = findProductInList(products, cartItems[i].id);
    if (!product) continue;

    const qtyElem = cartItems[i].querySelector('.quantity-number');
    const quantity = parseInt(qtyElem.textContent);
    const itemTotal = product.val * quantity;

    container.innerHTML += `
      <div class="flex justify-between text-xs tracking-wide text-gray-400">
        <span>${product.name} x ${quantity}</span>
        <span>₩${itemTotal.toLocaleString()}</span>
      </div>
    `;
  }
}

// 소계 렌더링
function renderSubtotal(container, subtotal) {
  container.innerHTML += `
    <div class="border-t border-white/10 my-3"></div>
    <div class="flex justify-between text-sm tracking-wide">
      <span>Subtotal</span>
      <span>₩${subtotal.toLocaleString()}</span>
    </div>
  `;
}

// 할인 상세 정보 렌더링
function renderDiscountDetails(container, calculations) {
  // 대량구매 할인 표시
  if (calculations.itemCount >= 30) {
    container.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-green-400">
        <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
        <span class="text-xs">-25%</span>
      </div>
    `;
  }
  // 개별 상품 할인 표시
  else if (calculations.itemDiscounts.length > 0) {
    calculations.itemDiscounts.forEach(function (item) {
      container.innerHTML += `
        <div class="flex justify-between text-sm tracking-wide text-green-400">
          <span class="text-xs">${item.name} (10개↑)</span>
          <span class="text-xs">-${item.discount}%</span>
        </div>
      `;
    });
  }

  // 화요일 할인 표시
  if (calculations.isTuesday && calculations.totalAmount > 0) {
    container.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-purple-400">
        <span class="text-xs">🌟 화요일 추가 할인</span>
        <span class="text-xs">-10%</span>
      </div>
    `;
  }
}

// 배송비 정보 렌더링
function renderShippingInfo(container) {
  container.innerHTML += `
    <div class="flex justify-between text-sm tracking-wide text-gray-400">
      <span>Shipping</span>
      <span>Free</span>
    </div>
  `;
}

// 할인 정보 업데이트
function updateDiscountInfo(calculations) {
  const discountInfoDiv = document.getElementById('discount-info');
  discountInfoDiv.innerHTML = '';

  if (calculations.discountRate > 0 && calculations.totalAmount > 0) {
    discountInfoDiv.innerHTML = `
      <div class="bg-green-500/20 rounded-lg p-3">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
          <span class="text-sm font-medium text-green-400">${(calculations.discountRate * 100).toFixed(1)}%</span>
        </div>
        <div class="text-2xs text-gray-300">₩${Math.round(calculations.savedAmount).toLocaleString()} 할인되었습니다</div>
      </div>
    `;
  }
}

// 화요일 특별 할인 표시 업데이트
function updateTuesdaySpecialDisplay(isTuesday, totalAmount) {
  const tuesdaySpecial = document.getElementById('tuesday-special');

  if (isTuesday && totalAmount > 0) {
    tuesdaySpecial.classList.remove('hidden');
  } else {
    tuesdaySpecial.classList.add('hidden');
  }
}

// 재고 정보 업데이트
function updateStockInfo(products) {
  const stockMsg = generateStockMessage(products);
  const stockInfo = document.getElementById('stock-status');
  stockInfo.textContent = stockMsg;
}
// 재고 정보 상세 업데이트 - 상수 적용
function handleStockInfoUpdate(products) {
  const totalStock = calculateTotalStock(products);
  const infoMsg = generateStockMessage(products);

  // 재고 부족 시 처리 - 상수 사용
  if (totalStock < STOCK_CONFIG.CRITICAL_STOCK_THRESHOLD) {
    //console.log('전체 재고가 30개 미만입니다.');
  }

  const stockInfo = document.getElementById('stock-status');
  stockInfo.textContent = infoMsg;
}

// 시각적 효과 적용
function applyVisualEffects(cartItems) {
  for (let i = 0; i < cartItems.length; i++) {
    const qtyElem = cartItems[i].querySelector('.quantity-number');
    const quantity = parseInt(qtyElem.textContent);
    const priceElems = cartItems[i].querySelectorAll('.text-lg, .text-xs');

    priceElems.forEach(function (elem) {
      if (elem.classList.contains('text-lg')) {
        elem.style.fontWeight = quantity >= 10 ? 'bold' : 'normal';
      }
    });
  }
}

// 보너스 포인트 렌더링 - 상수 적용
function renderBonusPoints(cartItems, products, cartState) {
  const cartDisp = document.getElementById('cart-items');
  if (cartDisp.children.length === 0) {
    document.getElementById('loyalty-points').style.display = 'none';
    return;
  }

  const pointsResult = calculateBonusPoints(cartItems, products, cartState.itemCnt, cartState.totalAmt);

  const ptsTag = document.getElementById('loyalty-points');
  if (ptsTag) {
    if (pointsResult.points > 0) {
      ptsTag.innerHTML = `
        <div>${UI_TEXT.POINTS_DISPLAY(pointsResult.points).replace(': ', ': <span class="font-bold">').replace('p', 'p</span>')}</div>
        <div class="text-2xs opacity-70 mt-1">${pointsResult.detail.join(', ')}</div>
      `;
      ptsTag.style.display = 'block';
    } else {
      ptsTag.textContent = UI_TEXT.POINTS_DISPLAY(0);
      ptsTag.style.display = 'block';
    }
  }
}

// 상품 찾기 헬퍼 함수
function findProductInList(products, productId) {
  for (let i = 0; i < products.length; i++) {
    if (products[i].id === productId) {
      return products[i];
    }
  }
  return null;
}

export {
  updateAllUI,
  updateCartDisplay,
  updateSummarySection,
  updateDiscountSection,
  updateStockSection,
  updateVisualEffects,
  updateBonusPoints,
};
