import { products } from './data/products.js';
import { CartState } from './services/cartStateService.js';
import { removeAllEvents, setupAllEvents } from './events/eventSetup.js';
import { startAllTimers, stopAllTimers } from './events/timerManager.js';
import { createMainGridHTML } from './templates/mainGrid.js';
import { calculateCart } from './services/calculator.js';
import { updateAllUI } from './services/uiUpdateService.js';
import { updateCartItemPrices } from './services/updatePrices.js';
import { createHeaderHTML } from './templates/header.js';
import { createManualButtonHTML, createManualOverlayHTML, setupManualEvents } from './templates/manual.js';
import { STOCK_CONFIG, UI_TEXT, CSS_CLASSES } from './utils/constants.js';

// 메인 함수 - 앱 초기화 오케스트레이션만 담당
function main() {
  initializeApp();
  renderInitialUI();
  setupInitialState();
  initializeSystems();
  registerCleanup();
}

// === 초기화 단계별 함수들 (단일 책임) ===

// 앱 상태만 초기화
function initializeApp() {
  CartState.reset();
}

// UI 렌더링만 담당
function renderInitialUI() {
  const root = document.getElementById('app');
  root.innerHTML = createAppHTML();
}

// 초기 상태 설정만 담당
function setupInitialState() {
  setupManualEvents();
  updateProductOptions();
  updateCartCalculations();
}

// 시스템들 초기화만 담당
function initializeSystems() {
  const callbacks = createSystemCallbacks();
  setupAllEvents(products, CartState, callbacks);
  startAllTimers(products, callbacks);
}

// 정리 함수 등록만 담당
function registerCleanup() {
  window.cleanupApp = createCleanupFunction();
}

// === 헬퍼 함수들 (단일 책임) ===

// HTML 생성만 담당
function createAppHTML() {
  return `
    ${createHeaderHTML()}
    ${createMainGridHTML()}
    ${createManualButtonHTML()}
    ${createManualOverlayHTML()}
  `;
}

// 콜백 객체 생성만 담당
function createSystemCallbacks() {
  return {
    onCartUpdate: updateCartCalculations,
    onUpdateSelectOptions: updateProductOptions,
    onUpdatePrices: updateProductPrices,
    getLastSelected: () => CartState.lastSelected,
  };
}

// 정리 함수 생성만 담당
function createCleanupFunction() {
  return () => {
    removeAllEvents();
    stopAllTimers();
  };
}

// === 제품 옵션 관련 함수들 (단일 책임 분리) ===

// 제품 옵션 업데이트 오케스트레이션만 담당
function updateProductOptions() {
  clearProductSelector();
  const totalStock = calculateTotalStock();
  addProductOptions();
  updateStockIndicator(totalStock);
}

// 선택자 초기화만 담당
function clearProductSelector() {
  const selector = document.getElementById('product-select');
  selector.innerHTML = '';
}

// 총 재고 계산만 담당
function calculateTotalStock() {
  return products.reduce((sum, product) => sum + product.q, 0);
}

// 옵션 추가만 담당
function addProductOptions() {
  const selector = document.getElementById('product-select');
  products.map(createProductOption).forEach((option) => selector.appendChild(option));
}

// 재고 표시 업데이트만 담당
function updateStockIndicator(totalStock) {
  const selector = document.getElementById('product-select');
  selector.style.borderColor = totalStock < STOCK_CONFIG.WARNING_STOCK_THRESHOLD ? 'orange' : '';
}

// 단일 상품 옵션 생성만 담당
function createProductOption(item) {
  const option = document.createElement('option');
  option.value = item.id;

  const config = getProductConfig(item);
  applyOptionConfig(option, config);

  return option;
}

// 상품 설정 결정만 담당
function getProductConfig(item) {
  return item.q === 0 ? getOutOfStockConfig(item) : getInStockConfig(item);
}

// 옵션 설정 적용만 담당
function applyOptionConfig(option, config) {
  option.textContent = config.text;
  if (config.className) option.className = config.className;
  if (config.disabled) option.disabled = config.disabled;
}

// 품절 상품 설정만 담당
function getOutOfStockConfig(item) {
  return {
    text: UI_TEXT.OUT_OF_STOCK(item.name, item.val, getDiscountFlags(item)),
    className: CSS_CLASSES.DISCOUNT.OUT_OF_STOCK,
    disabled: true,
  };
}

// 재고 있는 상품 설정만 담당
function getInStockConfig(item) {
  const discountType = determineDiscountType(item);
  return getDiscountConfig(item, discountType);
}

// 할인 타입 결정만 담당
function determineDiscountType(item) {
  if (item.onSale && item.suggestSale) return 'both';
  if (item.onSale) return 'onSale';
  if (item.suggestSale) return 'suggestSale';
  return 'normal';
}

// 할인 설정 반환만 담당
function getDiscountConfig(item, type) {
  const configMap = createDiscountConfigMap(item);
  return configMap.get(type);
}

// 할인 설정 맵 생성만 담당
function createDiscountConfigMap(item) {
  return new Map([
    [
      'both',
      {
        text: UI_TEXT.SUPER_SALE(item.name, item.originalVal, item.val),
        className: CSS_CLASSES.DISCOUNT.SUPER_SALE,
      },
    ],
    [
      'onSale',
      {
        text: UI_TEXT.FLASH_SALE(item.name, item.originalVal, item.val),
        className: CSS_CLASSES.DISCOUNT.FLASH_SALE,
      },
    ],
    [
      'suggestSale',
      {
        text: UI_TEXT.SUGGEST_SALE(item.name, item.originalVal, item.val),
        className: CSS_CLASSES.DISCOUNT.SUGGEST_SALE,
      },
    ],
    [
      'normal',
      {
        text: UI_TEXT.NORMAL_PRICE(item.name, item.val, getDiscountFlags(item)),
        className: null,
      },
    ],
  ]);
}

// 할인 플래그 생성만 담당
function getDiscountFlags(item) {
  const flags = collectDiscountFlags(item);
  return formatDiscountFlags(flags);
}

// 할인 플래그 수집만 담당
function collectDiscountFlags(item) {
  return [item.onSale && UI_TEXT.SALE_FLAG, item.suggestSale && UI_TEXT.SUGGEST_FLAG].filter(Boolean);
}

// 할인 플래그 포맷팅만 담당
function formatDiscountFlags(flags) {
  return flags.length > 0 ? ' ' + flags.join(' ') : '';
}

// === 장바구니 계산 관련 함수들 (단일 책임 분리) ===

// 장바구니 계산 오케스트레이션만 담당
function updateCartCalculations() {
  resetCartState();
  const { cartItems, calculations } = performCalculations();
  updateCartState(calculations);
  renderCartUI(cartItems, calculations);
}

// 카트 상태 초기화만 담당
function resetCartState() {
  CartState.updateTotalAmount(0);
  CartState.updateItemCount(0);
}

// 계산 수행만 담당
function performCalculations() {
  const cartDisp = document.getElementById('cart-items');
  const cartItems = cartDisp.children;
  const calculations = calculateCart(cartItems, products);

  return { cartItems, calculations };
}

// 카트 상태 업데이트만 담당
function updateCartState(calculations) {
  CartState.updateTotalAmount(calculations.totalAmount);
  CartState.updateItemCount(calculations.itemCount);
}

// 카트 UI 렌더링만 담당
function renderCartUI(cartItems, calculations) {
  updateAllUI(cartItems, calculations, CartState, products);
}

// 상품 가격 업데이트만 담당
function updateProductPrices() {
  updateCartItemPrices(products);
  updateCartCalculations();
}

// 앱 시작
main();

// 페이지 언로드 시 정리 (주석 해제 가능)
// window.addEventListener('beforeunload', () => {
//   if (window.cleanupApp) {
//     window.cleanupApp();
//   }
// });
