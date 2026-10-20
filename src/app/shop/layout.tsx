import type { ReactNode } from "react";
import { CartProvider } from "@/components/shop/CartProvider";
import CartLink from "@/components/shop/CartLink";

export default function ShopLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <CartProvider>
      <div className="shop-shell">
        <div className="shop-shell__cart">
          <CartLink />
        </div>

        {children}
      </div>
    </CartProvider>
  );
}
