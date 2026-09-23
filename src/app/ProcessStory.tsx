"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "01",
    label: "ТЕКСТИЛ",
    title: "Събиране и подбор на текстила",
    text: "Текстилният материал се подбира и сортира според състав, цвят и предназначение за бъдещата серия.",
  },
  {
    number: "02",
    label: "РАЗДРОБЯВАНЕ",
    title: "Превръщане във влакна",
    text: "Подбраният текстил се раздробява до влакнеста структура, подходяща за последващо формоване.",
  },
  {
    number: "03",
    label: "СМЕСВАНЕ",
    title: "Подготовка на материала",
    text: "Текстилните влакна се смесват със свързващ компонент, който позволява оформянето на стабилен композитен материал.",
  },
  {
    number: "04",
    label: "ПРЕСОВАНЕ",
    title: "Оформяне на текстилната тухла",
    text: "Подготвеният материал се поставя във форма и се пресова, за да получи своята характерна плътност, релеф и геометрия.",
  },
  {
    number: "05",
    label: "СУШЕНЕ",
    title: "Стабилизиране на формата",
    text: "След пресоването материалът преминава през процес на сушене и стабилизиране до достигане на готовата си структура.",
  },
  {
    number: "06",
    label: "ДИЗАЙН",
    title: "Готов материал за интериора",
    text: "Готовите текстилни тухли могат да се комбинират в различни цветове, текстури и композиции за стени и дизайнерски пространства.",
  },
];

export default function ProcessStory() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top - window.innerHeight * 0.45) -
              Math.abs(b.boundingClientRect.top - window.innerHeight * 0.45)
          );

        if (visible.length) {
          const index = Number(
            (visible[0].target as HTMLElement).dataset.step
          );
          setActive(index);
        }
      },
      {
        rootMargin: "-35% 0px -40% 0px",
        threshold: 0,
      }
    );

    refs.current.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="process-story" id="process">
      <div className="process-story__intro">
        <span className="process-story__eyebrow">
          ОТ ТЕКСТИЛЕН ОТПАДЪК ДО НОВ МАТЕРИАЛ
        </span>

        <h2>
          Шест стъпки. <em>Един нов живот за текстила.</em>
        </h2>
      </div>

      <div className="process-story__layout">

        <div className="process-visual-wrap">
          <div className="process-map">

            <div className="process-map__heading">
              <span>USS X KREATIV</span>
              <small>ПЪТЯТ НА МАТЕРИАЛА</small>
            </div>

            <svg
              className="process-map__svg"
              viewBox="0 0 760 570"
              role="img"
              aria-label="Процес по създаване на текстилни тухли"
            >
              <defs>
                <filter id="processGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="10" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <path
                className="process-route"
                d="M135 145 C235 145 250 145 315 145
                   C410 145 430 145 515 145
                   C610 145 630 205 630 275
                   C630 365 555 405 475 405
                   C375 405 350 405 270 405
                   C185 405 130 390 125 330"
              />

              {/* 01 TEXTILE */}
              <g className={`process-object ${active === 0 ? "is-active" : ""}`}>
                <circle className="process-glow" cx="125" cy="145" r="70" />

                <path
                  className="process-shape"
                  d="M75 105 C100 92 145 94 174 112
                     L160 205 H89 Z"
                />

                <path className="process-detail" d="M92 125 C112 140 143 139 160 122" />
                <path className="process-detail" d="M98 151 C118 163 139 162 154 150" />
                <path className="process-detail" d="M103 176 C120 185 138 184 150 174" />

                <text className="process-number" x="72" y="76">01</text>
                <text className="process-label" x="72" y="94">ТЕКСТИЛ</text>
              </g>

              {/* 02 SHREDDING */}
              <g className={`process-object ${active === 1 ? "is-active" : ""}`}>
                <circle className="process-glow" cx="325" cy="145" r="70" />

                <rect
                  className="process-shape"
                  x="278"
                  y="100"
                  width="95"
                  height="95"
                  rx="8"
                />

                <path className="process-detail" d="M298 118 L348 174" />
                <path className="process-detail" d="M348 118 L298 174" />
                <circle className="process-detail" cx="323" cy="146" r="17" />

                <text className="process-number" x="285" y="56">02</text>
                <text className="process-label" x="285" y="74">РАЗДРОБЯВАНЕ</text>
              </g>

              {/* 03 MIX */}
              <g className={`process-object ${active === 2 ? "is-active" : ""}`}>
                <circle className="process-glow" cx="525" cy="145" r="75" />

                <path
                  className="process-shape"
                  d="M480 105 H570 L558 193 H492 Z"
                />

                <path className="process-detail" d="M495 130 C515 114 538 154 558 132" />
                <path className="process-detail" d="M495 154 C515 138 538 178 558 156" />
                <path className="process-detail" d="M525 82 V110" />

                <text className="process-number" x="468" y="61">03</text>
                <text className="process-label" x="468" y="79">СМЕСВАНЕ</text>
              </g>

              {/* 04 PRESS */}
              <g className={`process-object ${active === 3 ? "is-active" : ""}`}>
                <circle className="process-glow" cx="580" cy="322" r="78" />

                <rect className="process-shape" x="520" y="295" width="120" height="55" rx="6" />
                <rect className="process-detail" x="545" y="255" width="70" height="30" rx="4" />
                <path className="process-detail" d="M580 285 V305" />
                <path className="process-detail" d="M538 330 H622" />

                <text className="process-number" x="550" y="222">04</text>
                <text className="process-label" x="550" y="240">ПРЕСОВАНЕ</text>
              </g>

              {/* 05 DRY */}
              <g className={`process-object ${active === 4 ? "is-active" : ""}`}>
                <circle className="process-glow" cx="385" cy="405" r="72" />

                <rect className="process-shape" x="330" y="365" width="110" height="75" rx="6" />
                <path className="process-detail" d="M350 385 H420" />
                <path className="process-detail" d="M350 405 H420" />
                <path className="process-detail" d="M350 425 H420" />

                <path className="process-detail" d="M355 345 C345 333 365 326 355 314" />
                <path className="process-detail" d="M385 345 C375 333 395 326 385 314" />
                <path className="process-detail" d="M415 345 C405 333 425 326 415 314" />

                <text className="process-number" x="337" y="494">05</text>
                <text className="process-label" x="337" y="512">СУШЕНЕ</text>
              </g>

              {/* 06 FINISHED BRICK */}
              <g className={`process-object ${active === 5 ? "is-active" : ""}`}>
                <circle className="process-glow" cx="155" cy="405" r="76" />

                <path
                  className="process-shape"
                  d="M90 378 L178 363 L216 390 L128 408 Z"
                />
                <path
                  className="process-shape"
                  d="M128 408 L216 390 L216 430 L128 448 Z"
                />
                <path
                  className="process-shape"
                  d="M90 378 L128 408 L128 448 L90 418 Z"
                />

                <path className="process-detail" d="M113 386 L151 414" />
                <path className="process-detail" d="M151 372 L188 399" />

                <text className="process-number" x="95" y="494">06</text>
                <text className="process-label" x="95" y="512">ДИЗАЙН</text>
              </g>
            </svg>

            <div className="process-map__footer">
              <span>АКТИВЕН ЕТАП</span>
              <strong>
                {steps[active].number} — {steps[active].label}
              </strong>
            </div>
          </div>
        </div>

        <div className="process-copy">
          {steps.map((step, index) => (
            <div
              key={step.number}
              data-step={index}
              ref={(el) => {
                refs.current[index] = el;
              }}
              className={`process-copy__step ${
                active === index ? "is-active" : ""
              }`}
            >
              <span className="process-copy__number">{step.number}</span>
              <div className="process-copy__line" />
              <span className="process-copy__label">{step.label}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
