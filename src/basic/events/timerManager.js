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

// 번개세일 타이머 시작
function startFlashSaleTimer(products, callbacks) {
  const lightningDelay = Math.random() * 10000;

  timers.flashSaleTimeout = setTimeout(() => {
    timers.flashSaleInterval = setInterval(() => {
      triggerFlashSale(products, callbacks);
    }, 30000);
  }, lightningDelay);
}

// 추천 상품 타이머 시작
function startSuggestSaleTimer(products, callbacks) {
  const suggestDelay = Math.random() * 20000;

  timers.suggestSaleTimeout = setTimeout(() => {
    timers.suggestSaleInterval = setInterval(() => {
      triggerSuggestSale(products, callbacks);
    }, 60000);
  }, suggestDelay);
}

// 번개세일 실행
function triggerFlashSale(products, callbacks) {
  const availableProducts = products.filter((product) => product.q > 0 && !product.onSale);

  if (availableProducts.length === 0) return;

  const luckyIdx = Math.floor(Math.random() * availableProducts.length);
  const luckyItem = availableProducts[luckyIdx];

  luckyItem.val = Math.round((luckyItem.originalVal * 80) / 100);
  luckyItem.onSale = true;

  alert('⚡번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');

  callbacks.onUpdateSelectOptions();
  callbacks.onUpdatePrices();
}

// 추천 세일 실행
function triggerSuggestSale(products, callbacks) {
  const cartDisp = document.getElementById('cart-items');
  if (cartDisp.children.length === 0) return;

  const lastSelected = callbacks.getLastSelected();
  if (!lastSelected) return;

  const suggestProduct = findSuggestProduct(products, lastSelected);
  if (!suggestProduct) return;

  alert('💝 ' + suggestProduct.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!');

  suggestProduct.val = Math.round((suggestProduct.val * 95) / 100);
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
