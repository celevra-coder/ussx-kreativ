"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  category_id: string | null;
  name: string;
  short_description: string | null;
  description: string | null;
  price_cents: number;
  currency: string;
  sku: string | null;
  stock_quantity: number;
  image_url: string | null;
  featured: boolean;
  active: boolean;
  categories?:
    | {
        id: string;
        name: string;
        slug: string;
      }
    | {
        id: string;
        name: string;
        slug: string;
      }[]
    | null;
};

type FormState = {
  name: string;
  category_id: string;
  short_description: string;
  description: string;
  price: string;
  sku: string;
  stock_quantity: string;
  image_url: string;
  featured: boolean;
  active: boolean;
};

const emptyForm: FormState = {
  name: "",
  category_id: "",
  short_description: "",
  description: "",
  price: "",
  sku: "",
  stock_quantity: "0",
  image_url: "",
  featured: false,
  active: true,
};

function categoryName(product: Product) {
  if (!product.categories) {
    return "—";
  }

  if (Array.isArray(product.categories)) {
    return product.categories[0]?.name ?? "—";
  }

  return product.categories.name ?? "—";
}

export default function AdminProductsPage() {
  const searchParams = useSearchParams();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [form, setForm] =
    useState<FormState>(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function load() {
    const [
      productsResponse,
      categoriesResponse,
    ] = await Promise.all([
      fetch("/api/admin/products", {
        cache: "no-store",
      }),

      fetch("/api/admin/categories", {
        cache: "no-store",
      }),
    ]);

    const productsData =
      await productsResponse.json();

    const categoriesData =
      await categoriesResponse.json();

    setProducts(
      productsData.products ?? []
    );

    setCategories(
      categoriesData.categories ?? []
    );
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const wantsNewProduct =
      searchParams.get("new") === "1";

    if (wantsNewProduct) {
      setEditingId(null);
      setForm(emptyForm);
      setMessage("");
      setShowForm(true);
    } else if (!editingId) {
      setShowForm(false);
    }
  }, [searchParams, editingId]);

  function openNewProduct() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function editProduct(
    product: Product
  ) {
    setEditingId(product.id);

    setForm({
      name:
        product.name,

      category_id:
        product.category_id ?? "",

      short_description:
        product.short_description ?? "",

      description:
        product.description ?? "",

      price:
        (
          product.price_cents / 100
        ).toFixed(2),

      sku:
        product.sku ?? "",

      stock_quantity:
        String(
          product.stock_quantity
        ),

      image_url:
        product.image_url ?? "",

      featured:
        product.featured,

      active:
        product.active,
    });

    setMessage("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");

    window.history.replaceState(
      {},
      "",
      "/admin/products"
    );
  }

  async function uploadImage(
    file: File
  ) {
    const data =
      new FormData();

    data.append("file", file);

    const response =
      await fetch(
        "/api/admin/upload",
        {
          method: "POST",
          body: data,
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ||
        "Грешка при качване."
      );
    }

    setForm((current) => ({
      ...current,
      image_url: result.url,
    }));
  }

  async function submit(
    event: FormEvent
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const url =
        editingId
          ? `/api/admin/products/${editingId}`
          : "/api/admin/products";

      const method =
        editingId
          ? "PATCH"
          : "POST";

      const response =
        await fetch(url, {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          body:
            JSON.stringify(form),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Грешка при запис."
        );
      }

      setMessage(
        editingId
          ? "Промените са записани."
          : "Продуктът е добавен."
      );

      await load();

      setTimeout(() => {
        closeForm();
      }, 700);
    }
    catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Възникна грешка."
      );
    }
    finally {
      setLoading(false);
    }
  }

  async function removeProduct(
    product: Product
  ) {
    const ok =
      window.confirm(
        `Сигурни ли сте, че искате да изтриете „${product.name}“?`
      );

    if (!ok) {
      return;
    }

    const response =
      await fetch(
        `/api/admin/products/${product.id}`,
        {
          method: "DELETE",
        }
      );

    if (!response.ok) {
      const data =
        await response.json();

      alert(
        data.error ||
        "Продуктът не можа да бъде изтрит."
      );

      return;
    }

    await load();
  }

  return (
    <main className="admin-page">
      <div className="admin-container">

        <div className="admin-products-topbar">

          <div>
            <a
              href="/admin"
              className="admin-back-link"
            >
              ← Назад към администрацията
            </a>

            <span className="admin-section-label">
              КАТАЛОГ
            </span>

            <h1>
              Управление на продукти
            </h1>
          </div>

          <a
            href="/admin/products?new=1"
            className="admin-primary-button admin-add-product-button"
          >
            + Добави продукт
          </a>

        </div>

        {showForm && (
          <section className="admin-product-editor">

            <div className="admin-product-editor-head">
              <div>
                <span>
                  {editingId
                    ? "РЕДАКЦИЯ"
                    : "НОВ ПРОДУКТ"}
                </span>

                <h2>
                  {editingId
                    ? "Редактиране на продукт"
                    : "Добавяне на продукт"}
                </h2>
              </div>

              <button
                type="button"
                className="admin-close-button"
                onClick={closeForm}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={submit}
              className="admin-product-form admin-product-form--clean"
            >

              <div className="admin-form-grid">

                <label>
                  Име на продукта *
                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name:
                          e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Категория *
                  <select
                    required
                    value={
                      form.category_id
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category_id:
                          e.target.value,
                      })
                    }
                  >
                    <option value="">
                      Избери категория
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  Цена (€) *
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price:
                          e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Наличност *
                  <input
                    type="number"
                    min="0"
                    required
                    value={
                      form.stock_quantity
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        stock_quantity:
                          e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  SKU
                  <input
                    value={form.sku}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sku:
                          e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Снимка
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={async (e) => {
                      const file =
                        e.target.files?.[0];

                      if (!file) {
                        return;
                      }

                      setLoading(true);

                      try {
                        await uploadImage(
                          file
                        );
                      }
                      catch (error) {
                        setMessage(
                          error instanceof Error
                            ? error.message
                            : "Грешка при качване."
                        );
                      }
                      finally {
                        setLoading(false);
                      }
                    }}
                  />
                </label>

              </div>

              <label>
                Кратко описание
                <textarea
                  rows={2}
                  value={
                    form.short_description
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      short_description:
                        e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Пълно описание
                <textarea
                  rows={6}
                  value={
                    form.description
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description:
                        e.target.value,
                    })
                  }
                />
              </label>

              {form.image_url && (
                <div className="admin-image-preview">
                  <img
                    src={form.image_url}
                    alt=""
                  />

                  <span>
                    Текуща снимка
                  </span>
                </div>
              )}

              <div className="admin-product-options">

                <label>
                  <input
                    type="checkbox"
                    checked={
                      form.active
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        active:
                          e.target.checked,
                      })
                    }
                  />

                  Видим в магазина
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={
                      form.featured
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        featured:
                          e.target.checked,
                      })
                    }
                  />

                  Препоръчан продукт
                </label>

              </div>

              {message && (
                <div className="admin-form-message">
                  {message}
                </div>
              )}

              <div className="admin-form-actions">

                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={loading}
                >
                  {loading
                    ? "Записване..."
                    : editingId
                      ? "Запази промените"
                      : "Добави продукта"}
                </button>

                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={closeForm}
                >
                  Отказ
                </button>

              </div>

            </form>
          </section>
        )}

        <section className="admin-panel">

          <div className="admin-panel-heading">
            <div>
              <span>
                ПРОДУКТИ
              </span>

              <h2>
                Всички продукти
              </h2>
            </div>

            <small>
              Общо: {products.length}
            </small>
          </div>

          <div className="admin-table-wrap">

            <table className="admin-table admin-product-table">

              <thead>
                <tr>
                  <th>Снимка</th>
                  <th>Продукт</th>
                  <th>Категория</th>
                  <th>Цена</th>
                  <th>Наличност</th>
                  <th>Видим</th>
                  <th>Препоръчан</th>
                  <th>Действия</th>
                </tr>
              </thead>

              <tbody>

                {products.map(
                  (product) => (

                    <tr key={product.id}>

                      <td>
                        <div className="admin-table-image">
                          {product.image_url ? (
                            <img
                              src={
                                product.image_url
                              }
                              alt={
                                product.name
                              }
                            />
                          ) : (
                            <span>
                              Няма
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <strong>
                          {product.name}
                        </strong>

                        {product.sku && (
                          <small>
                            SKU: {product.sku}
                          </small>
                        )}
                      </td>

                      <td>
                        {categoryName(
                          product
                        )}
                      </td>

                      <td>
                        <strong>
                          {(
                            product.price_cents /
                            100
                          ).toFixed(2)} €
                        </strong>
                      </td>

                      <td>
                        <span
                          className={
                            product.stock_quantity <= 3
                              ? "admin-stock-low"
                              : ""
                          }
                        >
                          <strong>
                            {product.stock_quantity}
                          </strong>{" "}
                          бр.
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            product.active
                              ? "admin-product-state admin-product-state--on"
                              : "admin-product-state admin-product-state--off"
                          }
                        >
                          {product.active
                            ? "Видим"
                            : "Скрит"}
                        </span>
                      </td>

                      <td>
                        {product.featured
                          ? "Да"
                          : "Не"}
                      </td>

                      <td>
                        <div className="admin-row-actions">

                          <button
                            type="button"
                            className="admin-edit-button"
                            onClick={() =>
                              editProduct(
                                product
                              )
                            }
                          >
                            Редактирай
                          </button>

                          <button
                            type="button"
                            className="admin-delete-button"
                            onClick={() =>
                              removeProduct(
                                product
                              )
                            }
                          >
                            Изтрий
                          </button>

                        </div>
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

      </div>
    </main>
  );
}
