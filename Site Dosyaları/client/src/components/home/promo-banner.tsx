import { useState, useEffect } from "react";
import { Link } from "wouter";

type TimerProps = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export default function PromoBanner() {
  const [timeLeft, setTimeLeft] = useState<TimerProps>({
    days: 0,
    hours: 12,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        let { days, hours, minutes, seconds } = prevTime;

        if (seconds > 0) {
          seconds -= 1;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes -= 1;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours -= 1;
            } else {
              hours = 23;
              if (days > 0) {
                days -= 1;
              }
            }
          }
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-10 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Yaz Fırsatları Başladı
            </h2>
            <p className="text-gray-300 mb-6">
              Tüm yaz ürünlerinde %30'a varan indirimler ve ücretsiz kargo fırsatı sizleri bekliyor. 
              Kampanya stoklarla sınırlıdır.
            </p>
            <div className="flex space-x-4">
              <Link
                href="/products?discount=true"
                className="bg-accent hover:bg-accent/90 text-white py-2 px-6 rounded-lg font-medium"
              >
                Fırsatları Keşfet
              </Link>
              <Link
                href="/promotions"
                className="bg-transparent border border-white text-white py-2 px-6 rounded-lg font-medium hover:bg-white/10"
              >
                Detaylar
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">
                  {String(timeLeft.days).padStart(2, "0")}
                </div>
                <div className="text-xs text-gray-300">Gün</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">
                  {String(timeLeft.hours).padStart(2, "0")}
                </div>
                <div className="text-xs text-gray-300">Saat</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </div>
                <div className="text-xs text-gray-300">Dakika</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </div>
                <div className="text-xs text-gray-300">Saniye</div>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <img
              src="https://images.pexels.com/photos/5632398/pexels-photo-5632398.jpeg"
              alt="Yaz Koleksiyonu"
              className="rounded-lg shadow-lg w-full h-[400px] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
