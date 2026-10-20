"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function CartLink() {
  const { itemCount } = useCart();

  return (
    <Link href="/shop/cart" className="shop-cart-link">
      Количка
      <span>{itemCount}</span>
    </Link>
  );
}
