import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">ErgiliBookShop</h3>
            <p className="text-gray-300 mb-4">
              Kaliteli ürünleri uygun fiyatlarla sunan online alışveriş platformu.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-accent">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-accent">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-accent">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-accent">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Kategoriler</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products/category/1" className="text-gray-300 hover:text-white">
                  Elektronik
                </Link>
              </li>
              <li>
                <Link href="/products/category/2" className="text-gray-300 hover:text-white">
                  Giyim
                </Link>
              </li>
              <li>
                <Link href="/products/category/3" className="text-gray-300 hover:text-white">
                  Ev & Yaşam
                </Link>
              </li>
              <li>
                <Link href="/products/category/4" className="text-gray-300 hover:text-white">
                  Oyun & Hobi
                </Link>
              </li>
              <li>
                <Link href="/products/category/5" className="text-gray-300 hover:text-white">
                  Aksesuar
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Bilgi</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-300 hover:text-white">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white">
                  Satış Sözleşmesi
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white">
                  Sıkça Sorulan Sorular
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Müşteri Hizmetleri</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/order-tracking" className="text-gray-300 hover:text-white">
                  Sipariş Takibi
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-white">
                  İade ve Değişim
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-white">
                  Kargo Bilgileri
                </Link>
              </li>
              <li>
                <Link href="/payment" className="text-gray-300 hover:text-white">
                  Ödeme Seçenekleri
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-400">
                &copy; {new Date().getFullYear()} ErgiliBookShop. Tüm hakları saklıdır.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-6 bg-gray-600 px-3 py-1 rounded text-xs flex items-center">VISA</div>
              <div className="h-6 bg-gray-600 px-3 py-1 rounded text-xs flex items-center">MASTERCARD</div>
              <div className="h-6 bg-gray-600 px-3 py-1 rounded text-xs flex items-center">PAYPAL</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
