import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HeroBanner from "@/components/home/hero-banner";
import FeaturedProducts from "@/components/home/featured-products";
import PromoBanner from "@/components/home/promo-banner";
import BestsellingProducts from "@/components/home/bestselling-products";
import ProductCategories from "@/components/home/product-categories";
import CustomerReviews from "@/components/home/customer-reviews";
import Newsletter from "@/components/home/newsletter";
import { Helmet } from "react-helmet";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>ErgiliBookShop | Kaliteli Kitapları Uygun Fiyatlarla Alın</title>
        <meta name="description" content="ErgiliBookShop, en kaliteli kitapları uygun fiyatlarla sunan online kitap mağazasıdır." />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          <HeroBanner />
          <FeaturedProducts />
          <PromoBanner />
          <BestsellingProducts />
          <ProductCategories />
          <CustomerReviews />
          <Newsletter />
        </main>
        
        <Footer />
      </div>
    </>
  );
}
