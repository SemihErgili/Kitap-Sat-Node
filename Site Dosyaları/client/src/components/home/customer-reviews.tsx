import { Link } from "wouter";
import { Star, StarHalf } from "lucide-react";

// Mock data for customer reviews
const reviews = [
  {
    id: 1,
    rating: 5,
    comment:
      "Siparişim çok hızlı geldi ve ürün beklediğimden çok daha kaliteli çıktı. Kesinlikle tavsiye ediyorum!",
    user: {
      name: "Ayşe Yılmaz",
      image: "https://randomuser.me/api/portraits/women/12.jpg",
      date: "2 hafta önce",
    },
  },
  {
    id: 2,
    rating: 4,
    comment:
      "Ürün kalitesi güzel fakat kargo biraz geç geldi. Yine de fiyat-performans olarak çok iyi.",
    user: {
      name: "Mehmet Kaya",
      image: "https://randomuser.me/api/portraits/men/22.jpg",
      date: "1 ay önce",
    },
  },
  {
    id: 3,
    rating: 4.5,
    comment:
      "Daha önce de alışveriş yapmıştım, yine aynı kalitede ürünler geldi. Müşteri hizmetleri de çok ilgili.",
    user: {
      name: "Zeynep Demir",
      image: "https://randomuser.me/api/portraits/women/32.jpg",
      date: "3 hafta önce",
    },
  },
];

// Helper component to render rating stars
const RatingStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="flex text-yellow-400 mb-3">
      {Array.from({ length: fullStars }).map((_, index) => (
        <Star key={index} className="fill-current" />
      ))}
      {hasHalfStar && <StarHalf className="fill-current" />}
      {Array.from({ length: 5 - fullStars - (hasHalfStar ? 1 : 0) }).map(
        (_, index) => (
          <Star key={`empty-${index}`} className="text-gray-300" />
        )
      )}
    </div>
  );
};

export default function CustomerReviews() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Müşteri Yorumları
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow p-6">
              <RatingStars rating={review.rating} />
              <p className="text-gray-600 mb-4">"{review.comment}"</p>
              <div className="flex items-center">
                <img
                  src={review.user.image}
                  alt={review.user.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h4 className="font-medium">{review.user.name}</h4>
                  <p className="text-sm text-gray-500">{review.user.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/reviews" className="text-primary hover:underline">
            Tüm Yorumları Gör
          </Link>
        </div>
      </div>
    </section>
  );
}
