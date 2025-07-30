// 장바구니 상태 관리 객체
export const CartState = {
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

  // 현재 상태 반환
  getState() {
    return {
      itemCnt: this.itemCnt,
      lastSelected: this.lastSelected,
      totalAmt: this.totalAmt,
    };
  },
};
