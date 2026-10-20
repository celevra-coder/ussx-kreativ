"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  async function logout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="admin-nav">

      <div className="admin-nav-main">

        <Link
          href="/admin"
          className={
            isActive("/admin") &&
            pathname === "/admin"
              ? "admin-nav-link admin-nav-link--active"
              : "admin-nav-link"
          }
        >
          Начало
        </Link>

        <Link
          href="/admin/orders"
          className={
            isActive("/admin/orders")
              ? "admin-nav-link admin-nav-link--active"
              : "admin-nav-link"
          }
        >
          Поръчки
        </Link>

        <Link
          href="/admin/products"
          className={
            isActive("/admin/products")
              ? "admin-nav-link admin-nav-link--active"
              : "admin-nav-link"
          }
        >
          Продукти
        </Link>

        <Link
          href="/admin/products?new=1"
          className="admin-nav-link"
        >
          + Добави продукт
        </Link>

      </div>

      <div className="admin-nav-side">

        <Link
          href="/shop"
          className="admin-nav-link"
        >
          Магазин
        </Link>

        <button
          type="button"
          onClick={logout}
          className="admin-nav-logout"
        >
          Изход
        </button>

      </div>

    </nav>
  );
}
