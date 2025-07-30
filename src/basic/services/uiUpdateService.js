import { generateStockMessage, calculateTotalStock, calculateBonusPoints } from './calculator.js';
import { UI_TEXT, STOCK_CONFIG } from '../utils/constants.js';

// 메인 UI 업데이트 - 한 번에 전체 렌더링
export function updateAllUI(cartItems, calculations, cartState, products) {
  renderCartSummary(cartState);
  renderOrderDetails(cartItems, calculations, products);
  renderDiscountInfo(calculations, cartState);
  renderStockInfo(products);
  renderBonusPoints(cartItems, products, cartState);
  applyVisualEffects(cartItems);
}

// 장바구니 요약 렌더링
function renderCartSummary(cartState) {
  const template = `
    ${UI_TEXT.CART_ITEM_COUNT(cartState.itemCnt)}
  `;
  document.getElementById('item-count').textContent = template;
  document.querySelector('#cart-total .text-2xl').textContent = `₩${Math.round(cartState.totalAmt).toLocaleString()}`;
}

// 주문 상세 렌더링
function renderOrderDetails(cartItems, calculations, products) {
  if (calculations.subtotal <= 0) {
    document.getElementById('summary-details').innerHTML = '';
    return;
  }

  const template = `
    ${createItemsList(cartItems, products)}
    <div class="border-t border-white/10 my-3"></div>
    <div class="flex justify-between text-sm tracking-wide">
      <span>Subtotal</span><span>₩${calculations.subtotal.toLocaleString()}</span>
    </div>
    ${createDiscountList(calculations)}
    <div class="flex justify-between text-sm tracking-wide text-gray-400">
      <span>Shipping</span><span>Free</span>
    </div>
  `;

  document.getElementById('summary-details').innerHTML = template;
}

// 할인 정보 렌더링
function renderDiscountInfo(calculations, cartState) {
  const discountTemplate =
    calculations.discountRate > 0 && calculations.totalAmount > 0
      ? `
    <div class="bg-green-500/20 rounded-lg p-3">
      <div class="flex justify-between items-center mb-1">
        <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
        <span class="text-sm font-medium text-green-400">${(calculations.discountRate * 100).toFixed(1)}%</span>
      </div>
      <div class="text-2xs text-gray-300">₩${Math.round(calculations.savedAmount).toLocaleString()} 할인되었습니다</div>
    </div>
  `
      : '';

  document.getElementById('discount-info').innerHTML = discountTemplate;
  document
    .getElementById('tuesday-special')
    .classList.toggle('hidden', !(calculations.isTuesday && cartState.totalAmt > 0));
}

// 재고 정보 렌더링
function renderStockInfo(products) {
  document.getElementById('stock-status').textContent = generateStockMessage(products);
}

// 보너스 포인트 렌더링
function renderBonusPoints(cartItems, products, cartState) {
  const element = document.getElementById('loyalty-points');

  if (cartItems.length === 0) {
    element.style.display = 'none';
    return;
  }

  const pointsData = calculateBonusPoints(cartItems, products, cartState.itemCnt, cartState.totalAmt);
  const template =
    pointsData.points > 0
      ? `
    <div>적립 포인트: <span class="font-bold">${pointsData.points}p</span></div>
    <div class="text-2xs opacity-70 mt-1">${pointsData.detail.join(', ')}</div>
  `
      : UI_TEXT.POINTS_DISPLAY(0);

  element.innerHTML = template;
  element.style.display = 'block';
}

// === 템플릿 생성 함수들 ===

function createItemsList(cartItems, products) {
  return Array.from(cartItems)
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      const qtyElement = item.querySelector('.quantity-number');

      if (!product || !qtyElement) return '';

      const quantity = parseInt(qtyElement.textContent);
      return `<div class="flex justify-between text-xs tracking-wide text-gray-400">
                <span>${product.name} x ${quantity}</span>
                <span>₩${(product.val * quantity).toLocaleString()}</span>
              </div>`;
    })
    .filter(Boolean)
    .join('');
}

function createDiscountList(calculations) {
  const discounts = [];

  if (calculations.itemCount >= 30) {
    discounts.push(['🎉 대량구매 할인 (30개 이상)', '-25%', 'text-green-400']);
  } else {
    calculations.itemDiscounts.forEach((item) => {
      discounts.push([`${item.name} (10개↑)`, `-${item.discount}%`, 'text-green-400']);
    });
  }

  if (calculations.isTuesday && calculations.totalAmount > 0) {
    discounts.push(['🌟 화요일 추가 할인', '-10%', 'text-purple-400']);
  }

  return discounts
    .map(
      ([label, discount, colorClass]) =>
        `<div class="flex justify-between text-sm tracking-wide ${colorClass}">
       <span class="text-xs">${label}</span>
       <span class="text-xs">${discount}</span>
     </div>`
    )
    .join('');
}

// 시각적 효과만 DOM 조작
function applyVisualEffects(cartItems) {
  Array.from(cartItems).forEach((item) => {
    const qtyElement = item.querySelector('.quantity-number');
    if (!qtyElement) return;

    const quantity = parseInt(qtyElement.textContent);
    item.querySelectorAll('.text-lg').forEach((elem) => {
      elem.style.fontWeight = quantity >= 10 ? 'bold' : 'normal';
    });
  });
}

export {
  updateAllUI,
  renderCartSummary as updateCartDisplay,
  renderOrderDetails as updateSummarySection,
  renderDiscountInfo as updateDiscountSection,
  renderStockInfo as updateStockSection,
  applyVisualEffects as updateVisualEffects,
  renderBonusPoints as updateBonusPoints,
};
