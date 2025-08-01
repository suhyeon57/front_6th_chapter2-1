import ShoppingCart from './components/cart/ShoppingCart';
import GuideToggle from './components/guide/GuideToggle';
import Header from './components/layout/Header';
import Layout from './components/layout/Layout';
import OrderSummary from './components/order/OrderSummary';

// 직접 products import
import { PRODUCTS } from '@/lib/products';
// Hooks
import { useCart } from './hooks/useCart';
import { useCalculations } from './hooks/useCalculations';

const App = () => {
  // Cart Hook 사용
  const { cartState, addItem, updateQuantity, removeItem, getCartItemWithProduct } = useCart();

  // 계산 Hook 추가 (할인, 총액 등)
  const calculations = useCalculations(cartState.items);

  // 총 아이템 수 계산
  const totalItemCount = cartState.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <Header itemCount={totalItemCount} />
      <GuideToggle />
      <Layout>
        <ShoppingCart
          products={PRODUCTS}
          cartState={cartState}
          onAddItem={addItem}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
        />
        <OrderSummary
          cartState={cartState}
          cartItemsWithProduct={getCartItemWithProduct()}
          calculations={calculations} // 계산 정보 추가
        />
      </Layout>
    </>
  );
};

export default App;
