import {
  createAddToCartHandler,
  createCartItemClickHandler,
  createProductSelectionHandler,
  createManualToggleHandler,
  createModalCloseHandler,
  createEscapeKeyHandler,
} from './eventHandlers.js';

// 모든 이벤트 리스너 설정
function setupAllEvents(products, cartState, callbacks) {
  setupCartEvents(products, cartState, callbacks);
  setupProductSelectionEvents(callbacks);
  setupModalEvents();
}

// 장바구니 관련 이벤트 설정
function setupCartEvents(products, cartState, callbacks) {
  const addToCartBtn = document.getElementById('add-to-cart');
  const cartItems = document.getElementById('cart-items');

  addToCartBtn.addEventListener('click', createAddToCartHandler(products, cartState, callbacks));

  cartItems.addEventListener('click', createCartItemClickHandler(products, callbacks));
}

// 상품 선택 관련 이벤트 설정
function setupProductSelectionEvents(callbacks) {
  const productSelect = document.getElementById('product-select');

  productSelect.addEventListener('change', createProductSelectionHandler());
  productSelect.addEventListener('focus', () => {
    callbacks.onUpdateSelectOptions();
  });
}

// 모달 관련 이벤트 설정
function setupModalEvents() {
  const manualButton = document.getElementById('manual-button');

  if (manualButton) {
    manualButton.addEventListener('click', createManualToggleHandler());
  }

  document.addEventListener('click', createModalCloseHandler());
  document.addEventListener('keydown', createEscapeKeyHandler());
}

// 이벤트 리스너 제거 함수
function removeAllEvents() {
  const elements = ['add-to-cart', 'cart-items', 'product-select', 'manual-button'];

  elements.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.replaceWith(element.cloneNode(true));
    }
  });
}

export { setupAllEvents, removeAllEvents };
