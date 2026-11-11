
import { useEffect, useState } from "react";

const slides = [
  {
    label: "KIOS SKRINING CAMPAK",
    title: "Deteksi dini campak, lebih cepat dan mudah.",
    description:
      "Lakukan skrining awal campak secara mandiri melalui kios MeaslesCare. Cukup gunakan kartu identitas, ambil foto ruam, dan isi gejala.",
    button: "Mulai Skrining",
  },
  {
    label: "PEMERIKSAAN MANDIRI",
    title: "Kenali gejala campak sejak dini.",
    description:
      "Lakukan pemeriksaan awal dengan mengikuti langkah-langkah sederhana melalui kios MeaslesCare. Prosesnya mudah dan dapat dilakukan secara mandiri.",
    button: "Pelajari Cara Penggunaan",
  },
  {
    label: "HASIL SKRINING",
    title: "Dapatkan hasil skrining dengan cepat dan mudah.",
    description:
      "Selesaikan tahapan pemeriksaan dan dapatkan hasil skrining awal beserta informasi dan saran tindak lanjut.",
    button: "Lihat Fungsi Alat",
  },
];

export default function BerandaPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeSlide = slides[activeIndex];

  const nextSlide = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  const prevSlide = () => {
    setActiveIndex(
      (current) => (current - 1 + slides.length) % slides.length
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main
      className="measles-hero"
      data-slide={activeIndex}
    >
      {/* Abstract Background */}
      <div className="abstract-background" aria-hidden="true">
        <div className="abstract-blob blob-one" />
        <div className="abstract-blob blob-two" />
        <div className="abstract-blob blob-three" />
        <div className="abstract-blob blob-four" />
        <div className="abstract-blob blob-five" />
        <div className="abstract-blob blob-six" />
      </div>

      {/* Main Content */}
      <section className="hero-content">
        <div
          className="hero-text"
          key={activeIndex}
        >
          <span className="hero-label">
            <span className="label-dot" />
            {activeSlide.label}
          </span>

          <h1>{activeSlide.title}</h1>

          <p>{activeSlide.description}</p>

          <a
            href={
              activeIndex === 0
                ? "/skrining"
                : activeIndex === 1
                  ? "/user/cara-penggunaan"
                  : "/user/fungsi-alat"
            }
            className="hero-button"
          >
            {activeSlide.button}
          </a>
        </div>

        {/* Carousel Navigation */}
        <div className="carousel-navigation">
          <div className="carousel-controls">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Slide sebelumnya"
              className="carousel-arrow"
            >
              ←
            </button>

            <button
              type="button"
              onClick={nextSlide}
              aria-label="Slide berikutnya"
              className="carousel-arrow"
            >
              →
            </button>
          </div>

          <div className="carousel-indicators">
            {slides.map((slide, index) => (
              <button
                key={slide.label}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Buka slide ${index + 1}`}
                aria-current={
                  activeIndex === index ? "true" : undefined
                }
                className={`carousel-dot ${
                  activeIndex === index ? "active" : ""
                }`}
              />
            ))}
          </div>

          <span className="carousel-counter">
            0{activeIndex + 1}
            <span className="counter-divider">/</span>
            0{slides.length}
          </span>
        </div>
      </section>

      {/* Bottom Decoration */}
      <div className="hero-bottom-wave" aria-hidden="true" />
    </main>
  );
}
