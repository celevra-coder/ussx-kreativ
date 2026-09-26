import Logo from "./Logo";
import ProcessStory from "./ProcessStory";
import ContactForm from "./ContactForm";
import Header from "./Header";
import HeroVideo from "./HeroVideo";

export default function Home() {
  return (
    <main className="site">
      <Header />

      <section className="hero" id="top">
        <div className="hero-inner">
          <div className="eyebrow">
            <span></span>
            USS X KREATIV
          </div>

          <h1>
            Текстилът получава <em>втори живот.</em>
            <br />
            Пространството — нов характер.
          </h1>

          <p className="lead">
            Рециклиран текстил, превърнат в дизайнерски тухли и стенни
            облицовки за интериори с характер. Материал, който съчетава
            устойчивост, текстура и архитектурна свобода.
          </p>

          <div className="actions">
            <a href="#contact" className="primary-button">
              Изпрати запитване
            </a>
            <a href="#projects" className="secondary-button">
              Разгледай материала ↓
            </a>
          </div>

          <div className="hero-media"><HeroVideo /></div>
</div>
</section>

      <section className="services" id="services">
  <div className="section-title">
    <span className="section-label">ПОЛЗИ</span>

    <h2>Три реални ползи. Един материал.</h2>

    <p>
      Рециклираният текстил не е само декоративен елемент —
      структурата на материала допринася за комфорта в интериора
      и дава нов живот на текстилния отпадък.
    </p>
  </div>

  <div className="cards">
    <article>
      <span className="card-tag">01</span>

      <h3>Топлинен комфорт</h3>

      <p>
        Текстилната структура има топлоизолационни свойства и може да
        допринесе за по-комфортна вътрешна повърхност на стените.
      </p>
    </article>

    <article>
      <span className="card-tag">02</span>

      <h3>Намаляване на шума</h3>

      <p>
        Порестата структура на материала поглъща част от звуковата енергия
        и подпомага акустичния комфорт в помещението.
      </p>
    </article>

    <article>
      <span className="card-tag">03</span>

      <h3>Втори живот за текстила</h3>

      <p>
        Текстилният отпадък се превръща в нов интериорен материал
        с характерна текстура, вместо да приключи жизнения си цикъл
        като отпадък.
      </p>
    </article>
  </div>
</section>

            <ProcessStory />

<section className="projects" id="projects">
  <div className="gallery-divider">
    <span>МАТЕРИАЛЪТ ОТБЛИЗО</span>
  </div>

  <div className="gallery-heading">
    <h2>
      Текстура, структура
      <br />
      <em>и характер.</em>
    </h2>

    <p>
      Рециклираният текстил се превръща в материал с ясно изразена
      повърхност, собствен рисунък и различна визуална идентичност
      във всяка серия.
    </p>
  </div>

  <div className="project-gallery">

    <article className="gallery-card gallery-card-large">
      <div
        className="gallery-image"
        style={{
          backgroundImage: "url('/gallery/textile-real-02.webp')",
          backgroundPosition: "center center",
        }}
      >
        <span>01</span>
      </div>

      <div className="gallery-caption">
        <div>
          <small>ТЕКСТУРА</small>
          <h3>Видими текстилни влакна</h3>
          <p className="gallery-description">
            Влакната остават част от визуалния характер на готовия материал
            и създават естествена, разпознаваема повърхност.
          </p>
        </div>
        <span className="gallery-arrow">↗</span>
      </div>
    </article>

    <article className="gallery-card">
      <div
        className="gallery-image"
        style={{
          backgroundImage: "url('/gallery/textile-real-03.webp')",
          backgroundPosition: "center center",
        }}
      >
        <span>02</span>
      </div>

      <div className="gallery-caption">
        <div>
          <small>СТРУКТУРА</small>
          <h3>Формован текстилен материал</h3>
          <p className="gallery-description">
            След подготовка и пресоване текстилът придобива стабилна форма,
            плътност и характерен релеф.
          </p>
        </div>
        <span className="gallery-arrow">↗</span>
      </div>
    </article>

    <article className="gallery-card gallery-card-wide">
      <div
        className="gallery-image"
        style={{
          backgroundImage: "url('/gallery/textile-real-04.webp')",
          backgroundPosition: "center center",
        }}
      >
        <span>03</span>
      </div>

      <div className="gallery-caption">
        <div>
          <small>ДЕТАЙЛ</small>
          <h3>Материал с индивидуален характер</h3>
          <p className="gallery-description">
            Цветът и рисунъкът зависят от използвания текстил, затова всяка
            повърхност носи собствена визуална идентичност.
          </p>
        </div>
        <span className="gallery-arrow">↗</span>
      </div>
    </article>

  </div>
</section>

<section className="equipment" id="material">
  <div className="equipment-divider"></div>

  <div className="equipment-inner">
    <div className="equipment-heading">
      <span className="equipment-kicker">— МАТЕРИАЛЪТ</span>

      <h2>Текстилът не е отпадък. Той е суровина.</h2>

      <p>
        Вместо да приключи жизнения си цикъл като отпадък,
        текстилът се превръща в нов материал с собствена текстура,
        цветове и архитектурно приложение.
      </p>
    </div>
  </div>

  <div className="cards">
    <article>
      <span className="card-tag">01</span>
      <h3>Рециклиран текстил</h3>
      <p>
        Материалът използва текстилни влакна като основа за създаването
        на нова декоративна повърхност.
      </p>
    </article>

    <article>
      <span className="card-tag">02</span>
      <h3>Изразена текстура</h3>
      <p>
        Влакната остават видима част от характера на материала и правят
        всяка серия визуално различима.
      </p>
    </article>

    <article>
      <span className="card-tag">03</span>
      <h3>Дизайн по проект</h3>
      <p>
        Цветът, композицията и начинът на подреждане могат да се адаптират
        към различни интериорни концепции.
      </p>
    </article>
  </div>
</section>

<section className="why-note">
  <div className="why-note-line"></div>

  <div className="why-note-inner">
    <span>ЗАЩО USS X KREATIV?</span>

    <p>
      Защото отпадъкът може да бъде начало на нов материал.
      Съчетаваме рециклиран текстил, дизайн и практично приложение,
      за да създаваме повърхности с собствен характер.
    </p>
  </div>
</section>

<section className="contact" id="contact">
        <div className="contact-copy">
          <span className="section-label">Контакти</span>
          <h2>Изпратете запитване за текстилните тухли.</h2>
          <p>
            Посочете какво ви е необходимо, приблизителната площ и предпочитаната визия. Ще се свържем с вас за уточняване на детайлите.
          </p>
        </div>

        <ContactForm />
      </section>

      <footer className="site-footer">
  <div className="footer-main">
    <div className="footer-brand-block">
      <a href="#top" className="footer-logo"><Logo footer /></a>

      <p>Рециклиран текстил, превърнат в материал за интериор, архитектура и дизайн.</p>
    </div>

    <div className="footer-column">
      <span className="footer-title">Контакти</span>

      <a href="tel:+359878881815">0878 881 815</a>
      <a href="mailto:office@ussone.com">office@ussone.com</a>
      <span>Пловдив, ул. Христо Ботев 27А</span>
      <span>Производствена база: Габрово, ул. Никола Войновски 8</span>
    </div>

    <div className="footer-column">
      <span className="footer-title">Навигация</span>

      <a href="#services">Продукти</a>
      <a href="#projects">Приложения</a>
      <a href="#material">Материалът</a>
      <a href="#contact">Запитване</a>
    </div>

    <div className="footer-column footer-action">
      <span className="footer-title">Интересувате се от текстилните тухли?</span>
      <a
        className="facebook-button"
        href="https://www.facebook.com/profile.php?id=61591372162296"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="USS X KREATIV във Facebook"
      >
        <span className="facebook-button__icon">f</span>
        Facebook
      </a>
      <p>Изпратете ни конкретно запитване.</p>
      <a className="footer-cta" href="#contact">
        Изпрати запитване ↗
      </a>
    </div>
  </div>

  <div className="footer-bottom">
    <span>© 2026 USS X KREATIV. Всички права запазени.</span>
    <a href="tel:+359878881815">0878 881 815</a>
  </div>
</footer>
    </main>
  );
}
