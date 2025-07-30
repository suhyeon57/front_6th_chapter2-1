import { validateProductSelection } from '../utils/searchProudcts.js';
import { addItemToCart, updateItemQuantity, removeItem } from '../services/cartService.js';

// 장바구니 추가 핸들러
function createAddToCartHandler(products, cartState, callbacks) {
  return function (event) {
    event.preventDefault();

    const selector = document.getElementById('product-select');
    const selectedId = selector.value;

    const validation = validateProductSelection(products, selectedId);
    if (!validation.isValid) return;

    const result = addItemToCart(products, selectedId);

    if (!result.success) {
      alert(result.message || '상품 추가에 실패했습니다.');
      return;
    }

    callbacks.onCartUpdate();
    cartState.updateLastSelected(selectedId);
  };
}

// 장바구니 아이템 클릭 핸들러
function createCartItemClickHandler(products, callbacks) {
  return function (event) {
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

    callbacks.onCartUpdate();
    callbacks.onUpdateSelectOptions();
  };
}

// 상품 선택 핸들러
function createProductSelectionHandler() {
  return function (event) {
    const selectedId = event.target.value;
    console.log('Selected product:', selectedId);
  };
}

// 매뉴얼 토글 핸들러
function createManualToggleHandler() {
  return function (event) {
    event.preventDefault();
    const overlay = document.getElementById('manual-overlay');
    overlay.classList.toggle('hidden');
  };
}

// 모달 닫기 핸들러
function createModalCloseHandler() {
  return function (event) {
    if (event.target.classList.contains('modal-overlay')) {
      const overlay = document.getElementById('manual-overlay');
      overlay.classList.add('hidden');
    }
  };
}

// ESC 키 핸들러
function createEscapeKeyHandler() {
  return function (event) {
    if (event.key === 'Escape') {
      const overlay = document.getElementById('manual-overlay');
      overlay.classList.add('hidden');
    }
  };
}

export {
  createAddToCartHandler,
  createCartItemClickHandler,
  createProductSelectionHandler,
  createManualToggleHandler,
  createModalCloseHandler,
  createEscapeKeyHandler,
};
