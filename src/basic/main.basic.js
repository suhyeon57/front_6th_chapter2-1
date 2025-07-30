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
import { createCartItemHTML } from './templates/cartItem.js';
import { findProductById, validateProductSelection, isProductAvailable } from './utils/searchProudcts.js';
import { addItemToCart, updateItemQuantity, removeItem } from './services/cartService.js';
import { updateCartItemPrices } from './services/updatePrices.js';

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

  // 번개세일 타이머 설정
  const lightningDelay = Math.random() * 10000;
  setTimeout(() => {
    setInterval(function () {
      const luckyIdx = Math.floor(Math.random() * products.length);
      const luckyItem = products[luckyIdx];
      if (luckyItem.q > 0 && !luckyItem.onSale) {
        luckyItem.val = Math.round((luckyItem.originalVal * 80) / 100);
        luckyItem.onSale = true;
        alert('⚡번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');
        onUpdateSelectOptions();
        doUpdatePricesInCart();
      }
    }, 30000);
  }, lightningDelay);

  // 추천 상품 타이머 설정
  setTimeout(function () {
    setInterval(function () {
      if (cartDisp.children.length === 0) {
        return;
      }
      if (CartState.lastSelected) {
        let suggest = null;
        for (let k = 0; k < products.length; k++) {
          if (products[k].id !== CartState.lastSelected) {
            if (products[k].q > 0) {
              if (!products[k].suggestSale) {
                suggest = products[k];
                break;
              }
            }
          }
        }
        if (suggest) {
          alert('💝 ' + suggest.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!');
          suggest.val = Math.round((suggest.val * (100 - 5)) / 100);
          suggest.suggestSale = true;
          onUpdateSelectOptions();
          doUpdatePricesInCart();
        }
      }
    }, 60000);
  }, Math.random() * 20000);
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

  // UI 업데이트
  updateItemCountDisplay();
  updateSummaryDetails(cartItems, calculations);
  updateCartTotal();
  updateDiscountInfo(calculations);
  updateTuesdaySpecialDisplay(calculations.isTuesday);
  updateStockInfo();
  applyVisualEffects(cartItems);

  // 하위 함수들 호출
  handleStockInfoUpdate();
  doRenderBonusPoints();
}

// UI 업데이트 헬퍼 함수들
function updateItemCountDisplay() {
  document.getElementById('item-count').textContent = '🛍️ ' + CartState.itemCnt + ' items in cart';
}

function updateCartTotal() {
  const cartTotal = document.getElementById('cart-total');
  const totalDiv = cartTotal.querySelector('.text-2xl');
  if (totalDiv) {
    totalDiv.textContent = '₩' + Math.round(CartState.totalAmt).toLocaleString();
  }
}

// 주문 요약 섹션 업데이트 함수 추가
function updateSummaryDetails(cartItems, calculations) {
  const summaryDetails = document.getElementById('summary-details');
  summaryDetails.innerHTML = '';

  if (calculations.subtotal > 0) {
    // 개별 아이템 표시
    for (let i = 0; i < cartItems.length; i++) {
      let curItem;
      for (let j = 0; j < products.length; j++) {
        if (products[j].id === cartItems[i].id) {
          curItem = products[j];
          break;
        }
      }
      const qtyElem = cartItems[i].querySelector('.quantity-number');
      const q = parseInt(qtyElem.textContent);
      const itemTotal = curItem.val * q;
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-xs tracking-wide text-gray-400">
          <span>${curItem.name} x ${q}</span>
          <span>₩${itemTotal.toLocaleString()}</span>
        </div>
      `;
    }

    // 소계 표시
    summaryDetails.innerHTML += `
      <div class="border-t border-white/10 my-3"></div>
      <div class="flex justify-between text-sm tracking-wide">
        <span>Subtotal</span>
        <span>₩${calculations.subtotal.toLocaleString()}</span>
      </div>
    `;

    // 할인 정보 표시
    if (calculations.itemCount >= 30) {
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-sm tracking-wide text-green-400">
          <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
          <span class="text-xs">-25%</span>
        </div>
      `;
    } else if (calculations.itemDiscounts.length > 0) {
      calculations.itemDiscounts.forEach(function (item) {
        summaryDetails.innerHTML += `
          <div class="flex justify-between text-sm tracking-wide text-green-400">
            <span class="text-xs">${item.name} (10개↑)</span>
            <span class="text-xs">-${item.discount}%</span>
          </div>
        `;
      });
    }

    // 화요일 할인 표시
    if (calculations.isTuesday) {
      if (calculations.totalAmount > 0) {
        summaryDetails.innerHTML += `
          <div class="flex justify-between text-sm tracking-wide text-purple-400">
            <span class="text-xs">🌟 화요일 추가 할인</span>
            <span class="text-xs">-10%</span>
          </div>
        `;
      }
    }

    // 배송비 정보 표시
    summaryDetails.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-gray-400">
        <span>Shipping</span>
        <span>Free</span>
      </div>
    `;
  }
}

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

function updateTuesdaySpecialDisplay(isTuesday) {
  const tuesdaySpecial = document.getElementById('tuesday-special');

  if (isTuesday && CartState.totalAmt > 0) {
    tuesdaySpecial.classList.remove('hidden');
  } else {
    tuesdaySpecial.classList.add('hidden');
  }
}

function updateStockInfo() {
  const stockMsg = generateStockMessage(products);
  const stockInfo = document.getElementById('stock-status');
  stockInfo.textContent = stockMsg;
}

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

// 장바구니 추가 버튼 이벤트 리스너 - 리팩토링된 버전
document.getElementById('add-to-cart').addEventListener('click', function () {
  const selector = document.getElementById('product-select');
  const selectedId = selector.value;

  const validation = validateProductSelection(products, selectedId);
  if (!validation.isValid) return;

  const result = addItemToCart(products, selectedId);

  if (!result.success) {
    alert(result.message || '상품 추가에 실패했습니다.');
    return;
  }

  handleCalculateCartStuff();
  CartState.updateLastSelected(selectedId);
});

// 장바구니 아이템 클릭 이벤트 리스너 - 리팩토링된 버전
document.getElementById('cart-items').addEventListener('click', function (event) {
  const target = event.target;

  if (!target.classList.contains('quantity-change') && !target.classList.contains('remove-item')) {
    return;
  }

  const productId = target.dataset.productId;

  if (target.classList.contains('quantity-change')) {
    const change = parseInt(target.dataset.change);
    const result = updateItemQuantity(products, productId, change);

    if (!result.success && result.message) {
      alert(result.message);
    }
  } else if (target.classList.contains('remove-item')) {
    removeItem(products, productId);
  }

  handleCalculateCartStuff();
  onUpdateSelectOptions();
});
