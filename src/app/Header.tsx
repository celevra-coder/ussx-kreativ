"use client";

import Logo from "./Logo";
import { useEffect, useState } from "react";

export default function Header() {
  const [dark, setDark] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  const toggleTheme = () => {
    setSwitching(true);
    document.documentElement.classList.add("theme-switching");

    window.setTimeout(() => {
      setDark((value) => !value);
    }, 120);

    window.setTimeout(() => {
      setSwitching(false);
      document.documentElement.classList.remove("theme-switching");
    }, 520);
  };

  return (
    <header className={`header ${scrolled ? "header-scrolled" : ""}`}>
      <a href="#top" className="logo" aria-label="USS X Kreativ">
        <Logo />
      </a>

      <div className="header-actions">
        <button
          type="button"
          className={`theme-toggle ${switching ? "is-switching" : ""}`}
          onClick={toggleTheme}
          aria-label={dark ? "Светла тема" : "Тъмна тема"}
          title={dark ? "Светла тема" : "Тъмна тема"}
        >
          <span className={!dark ? "theme-active" : ""}>☀</span>
          <span className={dark ? "theme-active" : ""}>☾</span>
        </button>

        <a href="/shop" className="shop-link">
  Онлайн магазин
</a>
<a className="signup-button" href="#contact">
          <span className="signup-dot">•</span>
          Свържи се
        </a>

        <a
          className="phone-circle"
          href="tel:+359878881815"
          aria-label="Обади се на 0878 881 815"
          title="0878 881 815"
        >
          ☎
        </a>
      </div>
    </header>
  );
}
