import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";

export default function HeroBanner() {
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <section className="relative">
      <div className="w-full h-[400px] md:h-[500px] bg-gray-100 overflow-hidden">
        <img
          src="https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg"
          alt="E-Ticaret Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-lg">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Yaz Koleksiyonu
              </h1>
              <p className="text-white text-lg mb-6">
                En yeni ürünlerde %50'ye varan indirimler
              </p>
              <Link
                href="/products?new=true"
                className="bg-accent hover:bg-accent/90 text-white py-3 px-6 rounded-lg font-medium transition duration-300 inline-block"
              >
                Hemen Keşfet
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 w-full">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mb-20 relative z-10">
            {categories?.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                href={`/products/category/${category.id}`}
                className="bg-white shadow-lg rounded-lg p-4 text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className={`${category.icon} text-primary`}></i>
                </div>
                <h3 className="font-medium">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
