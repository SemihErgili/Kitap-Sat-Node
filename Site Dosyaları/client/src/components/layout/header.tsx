import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, User, ShoppingCart, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import CartSidebar from "@/components/cart/cart-sidebar";
import AuthModal from "@/components/auth/auth-modal";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { getItemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // Close mobile menu when changing location
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const dropdown = document.getElementById('user-dropdown');
      const button = document.getElementById('user-dropdown-button');
      if (dropdown && !dropdown.classList.contains('hidden') && 
          button && !button.contains(event.target as Node) && 
          !dropdown.contains(event.target as Node)) {
        dropdown.classList.add('hidden');
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchUrl = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
      window.location.href = searchUrl;
    }
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const toggleCart = () => {
    setCartOpen(!cartOpen);
  };
  
  const toggleAuthModal = () => {
    setAuthModalOpen(!authModalOpen);
  };
  
  const itemCount = getItemCount();
  
  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">ErgiliBookShop</span>
            </Link>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 mx-10">
              <form onSubmit={handleSearch} className="relative w-full">
                <Input
                  type="text"
                  placeholder="Kitap, yazar veya kategori ara..."
                  className="w-full py-2 px-4 border border-gray-300 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </form>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/products" className="text-gray-700 hover:text-primary">
                Kategoriler
              </Link>
              <Link href="/products?featured=true" className="text-gray-700 hover:text-primary">
                Fırsatlar
              </Link>
              {user ? (
                <div className="relative" onMouseLeave={() => {}}>
                  <Button
                    id="user-dropdown-button"
                    variant="ghost"
                    className="flex items-center text-gray-700 hover:text-primary"
                    onClick={() => {
                      const dropdown = document.getElementById('user-dropdown');
                      if (dropdown) {
                        dropdown.classList.toggle('hidden');
                      }
                    }}
                    noRefresh
                  >
                    <User className="mr-1 h-4 w-4" />
                    {user.username}
                  </Button>
                  <div 
                    id="user-dropdown"
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white hidden z-50"
                    style={{ transition: 'all 0.2s ease-in-out' }}
                  >
                    <div className="py-1">
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Profilim
                      </Link>
                      <Link href="/profile/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Siparişlerim
                      </Link>
                      {user.username === "admin" && (
                        <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-200">
                          Admin Paneli
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-200"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-primary"
                  onClick={toggleAuthModal}
                  noRefresh
                >
                  <User className="mr-1 h-4 w-4" />
                  Giriş Yap
                </Button>
              )}
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-primary relative"
                onClick={toggleCart}
                noRefresh
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
              noRefresh
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </Button>
          </div>

          {/* Search Bar (Mobile) */}
          <div className="mt-4 md:hidden">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder="Kitap, yazar veya kategori ara..."
                className="w-full py-2 px-4 border border-gray-300 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden mt-4 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
            <nav className="flex flex-col space-y-3">
              <Link href="/products" className="text-gray-700 py-2 border-b border-gray-200">
                Kategoriler
              </Link>
              <Link href="/products?featured=true" className="text-gray-700 py-2 border-b border-gray-200">
                Fırsatlar
              </Link>
              {user ? (
                <>
                  <Link href="/profile" className="text-gray-700 py-2 border-b border-gray-200">
                    Profilim
                  </Link>
                  <Link href="/profile/orders" className="text-gray-700 py-2 border-b border-gray-200">
                    Siparişlerim
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-gray-700 py-2 border-b border-gray-200 w-full"
                  >
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <button
                  onClick={toggleAuthModal}
                  className="text-left text-gray-700 py-2 border-b border-gray-200 w-full"
                >
                  Giriş Yap / Kayıt Ol
                </button>
              )}
              <button
                onClick={toggleCart}
                className="text-gray-700 py-2 flex items-center justify-between"
              >
                <span>Sepetim</span>
                {itemCount > 0 && (
                  <span className="bg-accent text-white text-xs rounded-full px-2 py-1 ml-1">
                    {itemCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
