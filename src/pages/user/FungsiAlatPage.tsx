
import KioskScene from '@/components/kiosk/KioskScene'

interface FungsiItem {
  title: string
  description: string
  image: string
  alt: string
}

const FUNGSI_ITEMS: FungsiItem[] = [
  {
    title: 'Mengenali Identitas Pasien',
    description: 'Pasien cukup menempelkan kartu yang telah terdaftar.',
    image: '/images/reference/function-identity.png',
    alt: 'Ikon kartu identitas pasien',
  },
  {
    title: 'Mengambil Foto Ruam Kulit',
    description: 'Mengambil foto area kulit untuk melihat kondisi ruam secara lebih jelas.',
    image: '/images/reference/function-camera.png',
    alt: 'Ikon kamera',
  },
  {
    title: 'Mengukur Suhu Tubuh',
    description: 'Mengukur suhu tubuh secara cepat dan tanpa kontak langsung.',
    image: '/images/reference/function-temperature.png',
    alt: 'Ikon termometer',
  },
  {
    title: 'Mencatat Gejala',
    description: 'Mengumpulkan informasi gejala yang dirasakan melalui pertanyaan sederhana.',
    image: '/images/reference/function-symptoms.png',
    alt: 'Ikon checklist gejala',
  },
  {
    title: 'Menampilkan Hasil Skrining',
    description: 'Memberikan hasil skrining awal beserta saran tindak lanjut.',
    image: '/images/reference/function-result.png',
    alt: 'Ikon centang hasil skrining',
  },
]

export default function FungsiAlatPage() {
  return (
    <main className="relative -mt-[88px] h-dvh w-full overflow-hidden bg-[#f8faff] pt-[88px] max-lg:-mt-[72px] max-lg:h-auto max-lg:min-h-dvh max-lg:overflow-y-auto max-lg:pt-[72px]">
      {/* Background abstrak */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-36 -top-36 h-[340px] w-[340px] rounded-[42%_58%_55%_45%] bg-[#dce7ff]/45 blur-[3px]" />

        <div className="absolute -top-48 left-[35%] h-[370px] w-[450px] rotate-[-20deg] rounded-[38%_62%_55%_45%] bg-gradient-to-br from-[#a4e9df]/60 to-[#a5dce9]/50 blur-[3px]" />

        <div className="absolute -right-32 top-[38%] h-[240px] w-[300px] rounded-[45%_55%_60%_40%] bg-[#b8eee8]/40 blur-[3px]" />

        <div className="absolute -bottom-52 -left-28 h-[340px] w-[440px] rotate-12 rounded-[45%_55%_35%_65%] bg-gradient-to-br from-[#9db6f5]/45 to-[#c8d6ff]/35 blur-[3px]" />

        <div className="absolute -bottom-40 left-[43%] h-[220px] w-[320px] rounded-full bg-[#dce5ff]/40 blur-[3px]" />
      </div>

      {/* Konten utama */}
      <div className="relative z-10 mx-auto grid h-full min-h-0 max-w-[1600px] grid-cols-1 gap-4 px-5 py-5 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8 lg:px-12 lg:py-5">
        {/* Kolom kiri: judul dan model 3D */}
        <section className="flex min-h-0 flex-col">
          <div className="shrink-0">
            <h1 className="max-w-[500px] text-[27px] font-extrabold leading-[1.15] tracking-tight text-[#183b5b] sm:text-[30px] lg:text-[32px]">
              Apa yang Bisa Dilakukan Kios MeaslesCare?
            </h1>

            <p className="mt-2.5 max-w-[470px] text-[13px] leading-relaxed text-[#647990] sm:text-sm">
              Kios skrining campak yang membantu proses pemeriksaan awal
              secara cepat, mudah, dan mandiri.
            </p>
          </div>

          {/* Area model 3D */}
          <div className="relative mt-1 min-h-[320px] flex-1 lg:min-h-0">
            <KioskScene />
          </div>
        </section>

        {/* Kolom kanan: daftar fungsi */}
        <section
          aria-label="Daftar fungsi kios MeaslesCare"
          className="grid min-h-0 grid-cols-1 gap-2.5 lg:grid-rows-5 lg:gap-2.5"
        >
          {FUNGSI_ITEMS.map((item, index) => (
            <article
              key={item.title}
              className="flex min-h-[82px] items-center gap-3 rounded-[18px] border border-white/90 bg-white/85 px-3 py-2 shadow-[0_4px_14px_rgba(31,91,190,0.07)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(31,91,190,0.11)] sm:gap-4 sm:px-4 lg:min-h-0"
            >
              <div className="flex h-[58px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-[13px] bg-[#edf4ff] sm:h-[62px] sm:w-[84px] lg:h-[62px] lg:w-[84px]">
                <img
                  src={item.image}
                  alt={item.alt}
                  className="h-full w-full object-contain"
                  loading={index > 2 ? 'lazy' : 'eager'}
                />
              </div>

              <div className="min-w-0">
                <h2 className="text-[14px] font-bold leading-snug text-[#183b5b] sm:text-[15px]">
                  {item.title}
                </h2>

                <p className="mt-1 text-[12px] leading-[1.5] text-[#647990] sm:text-[13px]">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
