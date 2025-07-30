import { findProductById } from '../utils/searchProudcts.js';
import { createCartItemHTML } from '../templates/cartItem.js';

export function addItemToCart(products, productId) {
  const product = findProductById(products, productId);

  if (!product || product.q <= 0) {
    return { success: false, message: '상품을 찾을 수 없거나 재고가 부족합니다.' };
  }

  const existingItem = document.getElementById(product.id);

  if (existingItem) {
    return updateExistingItem(existingItem, product);
  } else {
    return createNewCartItem(product);
  }
}

function updateExistingItem(itemElement, product) {
  const qtyElem = itemElement.querySelector('.quantity-number');
  const currentQty = parseInt(qtyElem.textContent);
  const newQty = currentQty + 1;

  if (newQty <= product.q + currentQty) {
    qtyElem.textContent = newQty;
    product.q--;
    return { success: true };
  } else {
    return { success: false, message: '재고가 부족합니다.' };
  }
}

function createNewCartItem(product) {
  const cartDisp = document.getElementById('cart-items');
  const newItem = document.createElement('div');

  newItem.id = product.id;
  newItem.className =
    'grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0';
  newItem.innerHTML = createCartItemHTML(product);

  cartDisp.appendChild(newItem);
  product.q--;

  return { success: true };
}

export function updateItemQuantity(products, productId, change) {
  const product = findProductById(products, productId);
  const itemElem = document.getElementById(productId);

  if (!product || !itemElem) {
    return { success: false };
  }

  const qtyElem = itemElem.querySelector('.quantity-number');
  const currentQty = parseInt(qtyElem.textContent);
  const newQty = currentQty + change;

  if (newQty > 0 && newQty <= product.q + currentQty) {
    qtyElem.textContent = newQty;
    product.q -= change;
    return { success: true };
  } else if (newQty <= 0) {
    product.q += currentQty;
    itemElem.remove();
    return { success: true };
  }

  return { success: false, message: '재고가 부족합니다.' };
}

export function removeItem(products, productId) {
  const product = findProductById(products, productId);
  const itemElem = document.getElementById(productId);

  if (!product || !itemElem) return;

  const qtyElem = itemElem.querySelector('.quantity-number');
  const quantity = parseInt(qtyElem.textContent);

  product.q += quantity;
  itemElem.remove();
}
