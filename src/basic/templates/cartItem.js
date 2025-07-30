// 장바구니 아이템 HTML 생성 함수
export function createCartItemHTML(product) {
  const discountIcon = getDiscountIcon(product);
  const priceHTML = getPriceHTML(product);

  return `
    <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
      <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
    </div>
    <div>
      <h3 class="text-base font-normal mb-1 tracking-tight">${discountIcon}${product.name}</h3>
      <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
      <p class="text-xs text-black mb-3">${priceHTML}</p>
      <div class="flex items-center gap-4">
        <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${product.id}" data-change="-1">−</button>
        <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">1</span>
        <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${product.id}" data-change="1">+</button>
      </div>
    </div>
    <div class="text-right">
      <div class="text-lg mb-2 tracking-tight tabular-nums">${priceHTML}</div>
      <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${product.id}">Remove</a>
    </div>
  `;
}

function getDiscountIcon(product) {
  if (product.onSale && product.suggestSale) return '⚡💝';
  if (product.onSale) return '⚡';
  if (product.suggestSale) return '💝';
  return '';
}

function getPriceHTML(product) {
  if (product.onSale || product.suggestSale) {
    const colorClass =
      product.onSale && product.suggestSale ? 'text-purple-600' : product.onSale ? 'text-red-500' : 'text-blue-500';

    return `<span class="line-through text-gray-400">₩${product.originalVal.toLocaleString()}</span> <span class="${colorClass}">₩${product.val.toLocaleString()}</span>`;
  }
  return `₩${product.val.toLocaleString()}`;
}
