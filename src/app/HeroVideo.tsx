"use client";

import { useRef, useState } from "react";

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setMuted(video.muted);

    if (video.paused) {
      video.play().catch(() => {});
    }
  };

  return (
    <div className="academy-media-layout">
      <div className="academy-video-wrap">
        <video
          ref={videoRef}
          className="academy-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/media/textile-brick-hero.mp4" type="video/mp4" />
        </video>

        <div className="video-controls">
          <button
            type="button"
            className="round-control"
            onClick={toggleSound}
            aria-label={muted ? "Включи звук" : "Изключи звук"}
          >
            {muted ? "⌁" : "♪"}
          </button>
        </div>

        <div className="video-overlay-copy">
          <span>РЕЦИКЛИРАН ТЕКСТИЛ · USS X KREATIV</span>
          <strong>От текстилен отпадък до дизайнерски материал</strong>
        </div>
      </div>

      <div className="solar-info-column">
        <div className="solar-info-card">
          <span className="info-kicker">КАК СЕ СЪЗДАВА</span>

          <h3>Нов живот за текстила.</h3>

          <div className="solar-flow">
            <div>
              <span className="flow-icon">✂</span>
              <small>Текстил</small>
            </div>

            <span className="flow-arrow">→</span>

            <div>
              <span className="flow-icon">≋</span>
              <small>Раздробяване</small>
            </div>

            <span className="flow-arrow">→</span>

            <div>
              <span className="flow-icon">▣</span>
              <small>Пресоване</small>
            </div>

            <span className="flow-arrow">→</span>

            <div>
              <span className="flow-icon">▤</span>
              <small>Облицовка</small>
            </div>
          </div>

          <div className="storage-row">
            <span>＋</span>
            <div>
              <strong>Материал с характер</strong>
              <p>
                Цветът и текстурата на всяка серия се определят от използвания
                рециклиран текстил.
              </p>
            </div>
          </div>
        </div>

        <div className="info-card-footer">
          <p>
            Текстилният отпадък се трансформира в декоративен материал
            за интериор, архитектура и индивидуални дизайнерски решения.
          </p>
          <a href="#services">Научете повече ↗</a>
        </div>
      </div>
    </div>
  );
}
