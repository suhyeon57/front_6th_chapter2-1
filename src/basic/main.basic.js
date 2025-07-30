// 데이터 임포트
import { products } from '../data/products.js';
import { createHeaderHTML } from './templates/header.js';
import { createMainGridHTML } from './mainGrid.js';
import { createManualButtonHTML, createManualOverlayHTML, setupManualEvents } from './templates/manual.js';
import {
  calculateCart,
  calculateBonusPoints,
  generateStockMessage,
  calculateTotalStock,
} from './services/calculator.js';
import { updateCartItemPrices } from './services/updatePrices.js';
import { setupAllEvents, removeAllEvents } from './events/eventSetup.js';
import { startAllTimers, stopAllTimers } from './events/timerManager.js';
import { updateAllUI } from './services/uiUpdateService.js';

// 장바구니 상태 관리 객체
const CartState = {
  itemCnt: 0,
  lastSelected: null,
  totalAmt: 0,

  // 상태 초기화
  reset() {
    this.itemCnt = 0;
    this.lastSelected = null;
    this.totalAmt = 0;
  },

  // 아이템 수량 업데이트
  updateItemCount(count) {
    this.itemCnt = count;
  },

  // 마지막 선택 상품 업데이트
  updateLastSelected(productId) {
    this.lastSelected = productId;
  },

  // 총액 업데이트
  updateTotalAmount(amount) {
    this.totalAmt = amount;
  },
};

// 메인 함수 - 앱 초기화 및 UI 생성
function main() {
  // 전역 변수 초기화
  CartState.reset();

  // 루트 엘리먼트 생성
  const root = document.getElementById('app');
  root.innerHTML = `
    ${createHeaderHTML()}
    ${createMainGridHTML()}
    ${createManualButtonHTML()}
    ${createManualOverlayHTML()}
  `;

  setupManualEvents();

  // 초기 설정 함수 호출
  onUpdateSelectOptions();
  handleCalculateCartStuff();

  // 콜백 함수들 정의
  const callbacks = {
    onCartUpdate: handleCalculateCartStuff,
    onUpdateSelectOptions: onUpdateSelectOptions,
    onUpdatePrices: doUpdatePricesInCart,
    getLastSelected: () => CartState.lastSelected,
  };

  // 이벤트 시스템 초기화
  setupAllEvents(products, CartState, callbacks);

  // 타이머 시스템 초기화
  startAllTimers(products, callbacks);

  // 정리 함수를 전역에 등록
  window.cleanupApp = () => {
    removeAllEvents();
    stopAllTimers();
  };
}

// 제품 옵션 업데이트 함수 - 드롭다운 선택 옵션을 갱신
function onUpdateSelectOptions() {
  // 선택자 요소 초기화
  const selector = document.getElementById('product-select');
  selector.innerHTML = '';

  // 전체 재고 계산
  const totalStock = products.reduce((sum, product) => sum + product.q, 0);

  // 제품별 옵션 생성
  products.map(createProductOption).forEach((option) => selector.appendChild(option));

  // 재고 부족 시 시각적 표시
  selector.style.borderColor = totalStock < 50 ? 'orange' : '';
}

// 상품 옵션 생성
function createProductOption(item) {
  const option = document.createElement('option');
  option.value = item.id;

  const isOutOfStock = item.q === 0;
  const config = isOutOfStock ? getOutOfStockConfig(item) : getInStockConfig(item);

  option.textContent = config.text;
  if (config.className) option.className = config.className;
  if (config.disabled) option.disabled = config.disabled;

  return option;
}

// 품절 상품 설정
function getOutOfStockConfig(item) {
  return {
    text: `${item.name} - ${item.val}원 (품절)${getDiscountFlags(item)}`,
    className: 'text-gray-400',
    disabled: true,
  };
}

//재고 있는 상품 설정
function getInStockConfig(item) {
  const discountMap = new Map([
    [
      'both',
      {
        text: `⚡💝${item.name} - ${item.originalVal}원 → ${item.val}원 (25% SUPER SALE!)`,
        className: 'text-purple-600 font-bold',
      },
    ],
    [
      'onSale',
      {
        text: `⚡${item.name} - ${item.originalVal}원 → ${item.val}원 (20% SALE!)`,
        className: 'text-red-500 font-bold',
      },
    ],
    [
      'suggestSale',
      {
        text: `💝${item.name} - ${item.originalVal}원 → ${item.val}원 (5% 추천할인!)`,
        className: 'text-blue-500 font-bold',
      },
    ],
    [
      'normal',
      {
        text: `${item.name} - ${item.val}원${getDiscountFlags(item)}`,
        className: null,
      },
    ],
  ]);

  const type =
    item.onSale && item.suggestSale ? 'both' : item.onSale ? 'onSale' : item.suggestSale ? 'suggestSale' : 'normal';

  return discountMap.get(type);
}

// 할인 플래그 생성
function getDiscountFlags(item) {
  const flags = [item.onSale && '⚡SALE', item.suggestSale && '💝추천'].filter(Boolean);

  return flags.length > 0 ? ' ' + flags.join(' ') : '';
}

// 장바구니 계산 메인 함수 - 총액, 할인, 포인트 등 모든 계산을 처리
function handleCalculateCartStuff() {
  // CartState 초기화
  CartState.updateTotalAmount(0);
  CartState.updateItemCount(0);

  // 장바구니 아이템들 가져오기
  const cartDisp = document.getElementById('cart-items');
  const cartItems = cartDisp.children;

  // 계산 실행
  const calculations = calculateCart(cartItems, products);

  // CartState 업데이트
  CartState.updateTotalAmount(calculations.totalAmount);
  CartState.updateItemCount(calculations.itemCount);

  // 모든 UI 업데이트를 한 번에 처리
  updateAllUI(cartItems, calculations, CartState, products);

  // 하위 함수들 호출
  handleStockInfoUpdate();
  doRenderBonusPoints();
}

// 보너스 포인트 렌더링 함수 - 리팩토링된 버전
const doRenderBonusPoints = function () {
  const cartDisp = document.getElementById('cart-items');
  if (cartDisp.children.length === 0) {
    document.getElementById('loyalty-points').style.display = 'none';
    return;
  }

  // 계산 로직 분리
  const pointsResult = calculateBonusPoints(cartDisp.children, products, CartState.itemCnt, CartState.totalAmt);

  // UI 업데이트
  const ptsTag = document.getElementById('loyalty-points');
  if (ptsTag) {
    if (pointsResult.points > 0) {
      ptsTag.innerHTML =
        '<div>적립 포인트: <span class="font-bold">' +
        pointsResult.points +
        'p</span></div>' +
        '<div class="text-2xs opacity-70 mt-1">' +
        pointsResult.detail.join(', ') +
        '</div>';
      ptsTag.style.display = 'block';
    } else {
      ptsTag.textContent = '적립 포인트: 0p';
      ptsTag.style.display = 'block';
    }
  }
};

// 전체 재고 계산 함수 - 리팩토링된 버전
function onGetStockTotal() {
  return calculateTotalStock(products);
}

// 재고 정보 업데이트 함수 - 리팩토링된 버전
const handleStockInfoUpdate = function () {
  const totalStock = onGetStockTotal();
  const infoMsg = generateStockMessage(products);

  // 재고 부족 시 처리 (30개 미만)
  if (totalStock < 30) {
    //console.log('전체 재고가 30개 미만입니다.');
  }

  const stockInfo = document.getElementById('stock-status');
  stockInfo.textContent = infoMsg;
};

// 장바구니 내 상품 가격 업데이트 함수 - 할인 상태 변경 시 호출
function doUpdatePricesInCart() {
  updateCartItemPrices(products);
  handleCalculateCartStuff();
}
// 앱 초기화
main();

//페이지 언로드 시 정리
// window.addEventListener('beforeunload', () => {
//   if (window.cleanupApp) {
//     window.cleanupApp();
//   }
// });
