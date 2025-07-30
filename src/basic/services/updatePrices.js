import { findProductById } from '../utils/searchProudcts.js';
import { getPriceHTML, getDiscountIcon } from '../templates/cartItem.js';

export function updateCartItemPrices(products) {
  const cartItems = document.getElementById('cart-items').children;

  Array.from(cartItems).forEach((cartItem) => {
    updateSingleItemPrice(cartItem, products);
  });
}

function updateSingleItemPrice(cartItem, products) {
  const product = findProductById(products, cartItem.id);
  if (!product) return;

  const priceDiv = cartItem.querySelector('.text-lg');
  const nameDiv = cartItem.querySelector('h3');

  if (priceDiv) priceDiv.innerHTML = getPriceHTML(product);
  if (nameDiv) nameDiv.textContent = getDiscountIcon(product) + product.name;
}
