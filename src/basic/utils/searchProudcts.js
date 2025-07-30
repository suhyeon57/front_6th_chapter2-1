export function findProductById(products, id) {
  return products.find((product) => product.id === id);
}

export function validateProductSelection(products, selectedId) {
  if (!selectedId) return { isValid: false, product: null };

  const product = findProductById(products, selectedId);
  return {
    isValid: !!product,
    product: product,
  };
}

export function isProductAvailable(product) {
  return product && product.q > 0;
}
