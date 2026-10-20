"use client";

import { useState } from "react";
import { useCart } from "@/components/shop/CartProvider";

type ProductForCart = {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  currency: string;
  image_url: string | null;
  stock_quantity: number;
};

export default function AddToCartButton({
  product,
}: {
  product: ProductForCart;
}) {
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const disabled = product.stock_quantity <= 0;

  function decrease() {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  }

  function increase() {
    setQuantity((current) =>
      Math.min(
        product.stock_quantity,
        current + 1
      )
    );
  }

  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1400);
  }

  return (
    <div className="product-buy-box">
      {!disabled && (
        <div className="product-quantity-selector">
          <button
            type="button"
            onClick={decrease}
            disabled={quantity <= 1}
            aria-label="Намали количеството"
          >
            −
          </button>

          <span>{quantity}</span>

          <button
            type="button"
            onClick={increase}
            disabled={
              quantity >= product.stock_quantity
            }
            aria-label="Увеличи количеството"
          >
            +
          </button>
        </div>
      )}

      <button
        type="button"
        className="product-add-button"
        disabled={disabled}
        onClick={handleAddToCart}
      >
        {disabled
          ? "Изчерпан продукт"
          : added
            ? `Добавено ${quantity} бр. ✓`
            : "Добави в количката"}
      </button>
    </div>
  );
}
