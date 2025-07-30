// 왼쪽 컬럼 (상품 선택 + 장바구니) 템플릿
export function createLeftColumnHTML() {
  return `
    <div class="bg-white border border-gray-200 p-8 overflow-y-auto">
      <!-- 상품 선택 영역 -->
      <div class="mb-6 pb-6 border-b border-gray-200">
        <select id="product-select" class="w-full p-3 border border-gray-300 rounded-lg text-base mb-3">
          <!-- 옵션들이 JavaScript로 추가됩니다 -->
        </select>
        <button id="add-to-cart" class="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all">
          Add to Cart
        </button>
        <div id="stock-status" class="text-xs text-red-500 mt-3 whitespace-pre-line"></div>
      </div>

      <!-- 장바구니 아이템들 -->
      <div id="cart-items">
        <!-- 장바구니 아이템들이 여기에 추가됩니다 -->
      </div>
    </div>
  `;
}
