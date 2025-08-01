import React from 'react';

// 상수 정의 (바닐라 JS와 동일)
const CART_ITEM_COUNT = (count: number) => `🛍️ ${count} items in cart`;

interface HeaderProps {
  itemCount: number;
}

const Header: React.FC<HeaderProps> = ({ itemCount }) => {
  return (
    <div className="mb-8">
      <h1 className="text-xs font-medium tracking-extra-wide uppercase mb-2">🛒 Hanghae Online Store</h1>
      <div className="text-5xl tracking-tight leading-none">Shopping Cart</div>
      <p id="item-count" className="text-sm text-gray-500 font-normal mt-3">
        {CART_ITEM_COUNT(itemCount)}
      </p>
    </div>
  );
};

export default Header;
