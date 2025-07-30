import { TIMER_CONFIG, DISCOUNT_RATES, UI_TEXT } from '../utils/constants.js';

// 타이머 ID 저장 객체
const timers = {
  flashSaleTimeout: null,
  flashSaleInterval: null,
  suggestSaleTimeout: null,
  suggestSaleInterval: null,
};

// 모든 타이머 시작
function startAllTimers(products, callbacks) {
  startFlashSaleTimer(products, callbacks);
  startSuggestSaleTimer(products, callbacks);
}

// 번개세일 타이머 시작 - 상수 적용
function startFlashSaleTimer(products, callbacks) {
  const lightningDelay = Math.random() * TIMER_CONFIG.MAX_FLASH_DELAY;

  timers.flashSaleTimeout = setTimeout(() => {
    timers.flashSaleInterval = setInterval(() => {
      triggerFlashSale(products, callbacks);
    }, TIMER_CONFIG.FLASH_SALE_INTERVAL);
  }, lightningDelay);
}

// 추천 상품 타이머 시작 - 상수 적용
function startSuggestSaleTimer(products, callbacks) {
  const suggestDelay = Math.random() * TIMER_CONFIG.MAX_SUGGEST_DELAY;

  timers.suggestSaleTimeout = setTimeout(() => {
    timers.suggestSaleInterval = setInterval(() => {
      triggerSuggestSale(products, callbacks);
    }, TIMER_CONFIG.SUGGEST_SALE_INTERVAL);
  }, suggestDelay);
}

// 번개세일 실행 - 상수 적용
function triggerFlashSale(products, callbacks) {
  const availableProducts = products.filter((product) => product.q > 0 && !product.onSale);

  if (availableProducts.length === 0) return;

  const luckyIdx = Math.floor(Math.random() * availableProducts.length);
  const luckyItem = availableProducts[luckyIdx];

  luckyItem.val = Math.round(luckyItem.originalVal * (1 - DISCOUNT_RATES.FLASH_SALE_RATE));
  luckyItem.onSale = true;

  alert(UI_TEXT.FLASH_SALE_ALERT(luckyItem.name));

  callbacks.onUpdateSelectOptions();
  callbacks.onUpdatePrices();
}

// 추천 세일 실행 - 상수 적용
function triggerSuggestSale(products, callbacks) {
  const cartDisp = document.getElementById('cart-items');
  if (cartDisp.children.length === 0) return;

  const lastSelected = callbacks.getLastSelected();
  if (!lastSelected) return;

  const suggestProduct = findSuggestProduct(products, lastSelected);
  if (!suggestProduct) return;

  alert(UI_TEXT.SUGGEST_SALE_ALERT(suggestProduct.name));

  suggestProduct.val = Math.round(suggestProduct.val * (1 - DISCOUNT_RATES.SUGGEST_SALE_RATE));
  suggestProduct.suggestSale = true;

  callbacks.onUpdateSelectOptions();
  callbacks.onUpdatePrices();
}

// 추천 상품 찾기
function findSuggestProduct(products, lastSelected) {
  return products.find((product) => product.id !== lastSelected && product.q > 0 && !product.suggestSale);
}

// 모든 타이머 정지
function stopAllTimers() {
  Object.values(timers).forEach((timerId) => {
    if (timerId) {
      clearTimeout(timerId);
      clearInterval(timerId);
    }
  });

  Object.keys(timers).forEach((key) => {
    timers[key] = null;
  });
}

export { startAllTimers, stopAllTimers, triggerFlashSale, triggerSuggestSale };
