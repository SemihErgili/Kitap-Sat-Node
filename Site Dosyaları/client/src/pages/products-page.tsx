import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Category, Product } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductGrid from "@/components/products/product-grid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { Helmet } from "react-helmet";

export default function ProductsPage() {
  const [location, params] = useLocation();
  const categoryId = params && params?.categoryId ? parseInt(params.categoryId) : undefined;
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("search") || "";
  const featured = urlParams.get("featured") === "true";
  const bestselling = urlParams.get("bestselling") === "true";
  const isNew = urlParams.get("new") === "true";
  const discount = urlParams.get("discount") === "true";
  
  // Local state for filters
  const [search, setSearch] = useState(searchQuery);
  const [filters, setFilters] = useState({
    categoryId: categoryId,
    featured: featured,
    bestselling: bestselling,
    new: isNew,
    discount: discount,
    minPrice: 0,
    maxPrice: 10000,
  });
  const [sort, setSort] = useState("default");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Fetch all products
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products", categoryId, searchQuery],
  });
  
  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Filter products
  const filteredProducts = products ? products.filter((product) => {
    // Search filter
    if (search && !product.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (filters.categoryId && product.categoryId !== filters.categoryId) {
      return false;
    }
    
    // Featured filter
    if (filters.featured && !product.isFeatured) {
      return false;
    }
    
    // Bestselling filter
    if (filters.bestselling && !product.isBestseller) {
      return false;
    }
    
    // New filter
    if (filters.new && !product.isNew) {
      return false;
    }
    
    // Discount filter
    if (filters.discount && !product.discountPrice) {
      return false;
    }
    
    // Price range filter
    const price = product.discountPrice || product.price;
    if (price < filters.minPrice || price > filters.maxPrice) {
      return false;
    }
    
    return true;
  }) : [];
  
  // Sort products
  const sortedProducts = filteredProducts?.slice().sort((a, b) => {
    const priceA = a.discountPrice || a.price;
    const priceB = b.discountPrice || b.price;
    
    switch (sort) {
      case "price-asc":
        return priceA - priceB;
      case "price-desc":
        return priceB - priceA;
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });
  
  // Get current category name
  const categoryName = categoryId 
    ? categories?.find(c => c.id === categoryId)?.name 
    : "Tüm Ürünler";
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (search) params.set("search", search);
    if (filters.featured) params.set("featured", "true");
    if (filters.bestselling) params.set("bestselling", "true");
    if (filters.new) params.set("new", "true");
    if (filters.discount) params.set("discount", "true");
    
    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", url);
  }, [filters, search]);
  
  const handleClearFilters = () => {
    setFilters({
      categoryId: undefined,
      featured: false,
      bestselling: false,
      new: false,
      discount: false,
      minPrice: 0,
      maxPrice: 10000,
    });
    setSearch("");
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter products based on current search input
  };
  
  const pageTitle = categoryName 
    ? `${categoryName} | ErgiliBookShop` 
    : (searchQuery 
      ? `Arama: ${searchQuery} | ErgiliBookShop` 
      : "Tüm Ürünler | ErgiliBookShop");
  
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={`ErgiliBookShop - ${categoryName || "Tüm ürünlerimiz"}. En kaliteli ürünleri uygun fiyatlarla alın.`} />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">
                {categoryName || (searchQuery ? `"${searchQuery}" için sonuçlar` : "Tüm Ürünler")}
              </h1>
              
              <div className="flex items-center space-x-3">
                <div className="hidden md:block">
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sıralama" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Varsayılan Sıralama</SelectItem>
                      <SelectItem value="price-asc">Fiyat (Artan)</SelectItem>
                      <SelectItem value="price-desc">Fiyat (Azalan)</SelectItem>
                      <SelectItem value="name-asc">İsim (A-Z)</SelectItem>
                      <SelectItem value="name-desc">İsim (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  variant="outline"
                  className="flex items-center md:hidden"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrele
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Filters - Desktop */}
              <div className="hidden md:block w-64 flex-shrink-0">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="mb-6">
                    <h3 className="font-medium mb-3">Ara</h3>
                    <form onSubmit={handleSearch} className="relative">
                      <Input
                        type="text"
                        placeholder="Ürün ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pr-10"
                      />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full space-y-2">
                    <AccordionItem value="category">
                      <AccordionTrigger>Kategoriler</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="all-categories"
                              checked={!filters.categoryId}
                              onCheckedChange={() => setFilters({...filters, categoryId: undefined})}
                            />
                            <Label htmlFor="all-categories">Tüm Kategoriler</Label>
                          </div>
                          
                          {categories?.map((category) => (
                            <div key={category.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`category-${category.id}`}
                                checked={filters.categoryId === category.id}
                                onCheckedChange={() => setFilters({...filters, categoryId: category.id})}
                              />
                              <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="price">
                      <AccordionTrigger>Fiyat Aralığı</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <Slider
                            defaultValue={[filters.minPrice, filters.maxPrice]}
                            min={0}
                            max={10000}
                            step={100}
                            onValueChange={(value) => setFilters({
                              ...filters,
                              minPrice: value[0],
                              maxPrice: value[1]
                            })}
                            className="my-6"
                          />
                          
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <span>₺{filters.minPrice}</span> - <span>₺{filters.maxPrice}</span>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="features">
                      <AccordionTrigger>Özellikler</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="filter-featured"
                              checked={filters.featured}
                              onCheckedChange={(checked) => setFilters({...filters, featured: checked as boolean})}
                            />
                            <Label htmlFor="filter-featured">Öne Çıkanlar</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="filter-bestselling"
                              checked={filters.bestselling}
                              onCheckedChange={(checked) => setFilters({...filters, bestselling: checked as boolean})}
                            />
                            <Label htmlFor="filter-bestselling">Çok Satanlar</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="filter-new"
                              checked={filters.new}
                              onCheckedChange={(checked) => setFilters({...filters, new: checked as boolean})}
                            />
                            <Label htmlFor="filter-new">Yeni Ürünler</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="filter-discount"
                              checked={filters.discount}
                              onCheckedChange={(checked) => setFilters({...filters, discount: checked as boolean})}
                            />
                            <Label htmlFor="filter-discount">İndirimli Ürünler</Label>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={handleClearFilters}
                  >
                    Filtreleri Temizle
                  </Button>
                </div>
              </div>
              
              {/* Products Grid */}
              <div className="flex-1">
                {/* Sort - Mobile */}
                <div className="md:hidden mb-4">
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sıralama" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Varsayılan Sıralama</SelectItem>
                      <SelectItem value="price-asc">Fiyat (Artan)</SelectItem>
                      <SelectItem value="price-desc">Fiyat (Azalan)</SelectItem>
                      <SelectItem value="name-asc">İsim (A-Z)</SelectItem>
                      <SelectItem value="name-desc">İsim (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Active filters */}
                {(filters.categoryId || filters.featured || filters.bestselling || filters.new || filters.discount || filters.minPrice > 0 || filters.maxPrice < 10000 || search) && (
                  <div className="bg-gray-50 p-2 rounded mb-4 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Aktif Filtreler:</span>
                    
                    {filters.categoryId && categories && (
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs flex items-center">
                        {categories.find(c => c.id === filters.categoryId)?.name}
                        <button
                          className="ml-1"
                          onClick={() => setFilters({...filters, categoryId: undefined})}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    
                    {filters.featured && (
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs flex items-center">
                        Öne Çıkanlar
                        <button
                          className="ml-1"
                          onClick={() => setFilters({...filters, featured: false})}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    
                    {filters.bestselling && (
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs flex items-center">
                        Çok Satanlar
                        <button
                          className="ml-1"
                          onClick={() => setFilters({...filters, bestselling: false})}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    
                    {filters.new && (
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs flex items-center">
                        Yeni Ürünler
                        <button
                          className="ml-1"
                          onClick={() => setFilters({...filters, new: false})}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    
                    {filters.discount && (
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs flex items-center">
                        İndirimli Ürünler
                        <button
                          className="ml-1"
                          onClick={() => setFilters({...filters, discount: false})}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    
                    {(filters.minPrice > 0 || filters.maxPrice < 10000) && (
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs flex items-center">
                        {filters.minPrice}₺ - {filters.maxPrice}₺
                        <button
                          className="ml-1"
                          onClick={() => setFilters({...filters, minPrice: 0, maxPrice: 10000})}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    
                    {search && (
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs flex items-center">
                        Arama: {search}
                        <button
                          className="ml-1"
                          onClick={() => setSearch("")}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-xs"
                      onClick={handleClearFilters}
                    >
                      Tümünü Temizle
                    </Button>
                  </div>
                )}
                
                <ProductGrid
                  products={sortedProducts}
                  isLoading={isLoadingProducts}
                />
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
        
        {/* Mobile Filters Sidebar */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden transition-opacity duration-300 ${
            mobileFiltersOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMobileFiltersOpen(false)}
        >
          <div
            className={`absolute top-0 left-0 h-full w-4/5 max-w-sm bg-white transform transition-transform duration-300 ${
              mobileFiltersOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold">Filtreler</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileFiltersOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(100%-80px)]">
              <div className="mb-6">
                <h3 className="font-medium mb-3">Ara</h3>
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Ürün ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pr-10"
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>
              
              <Accordion type="single" collapsible className="w-full space-y-2">
                <AccordionItem value="category">
                  <AccordionTrigger>Kategoriler</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="all-categories-mobile"
                          checked={!filters.categoryId}
                          onCheckedChange={() => setFilters({...filters, categoryId: undefined})}
                        />
                        <Label htmlFor="all-categories-mobile">Tüm Kategoriler</Label>
                      </div>
                      
                      {categories?.map((category) => (
                        <div key={`mobile-${category.id}`} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-mobile-${category.id}`}
                            checked={filters.categoryId === category.id}
                            onCheckedChange={() => setFilters({...filters, categoryId: category.id})}
                          />
                          <Label htmlFor={`category-mobile-${category.id}`}>{category.name}</Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="price">
                  <AccordionTrigger>Fiyat Aralığı</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <Slider
                        defaultValue={[filters.minPrice, filters.maxPrice]}
                        min={0}
                        max={10000}
                        step={100}
                        onValueChange={(value) => setFilters({
                          ...filters,
                          minPrice: value[0],
                          maxPrice: value[1]
                        })}
                        className="my-6"
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span>₺{filters.minPrice}</span> - <span>₺{filters.maxPrice}</span>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="features">
                  <AccordionTrigger>Özellikler</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-featured-mobile"
                          checked={filters.featured}
                          onCheckedChange={(checked) => setFilters({...filters, featured: checked as boolean})}
                        />
                        <Label htmlFor="filter-featured-mobile">Öne Çıkanlar</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-bestselling-mobile"
                          checked={filters.bestselling}
                          onCheckedChange={(checked) => setFilters({...filters, bestselling: checked as boolean})}
                        />
                        <Label htmlFor="filter-bestselling-mobile">Çok Satanlar</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-new-mobile"
                          checked={filters.new}
                          onCheckedChange={(checked) => setFilters({...filters, new: checked as boolean})}
                        />
                        <Label htmlFor="filter-new-mobile">Yeni Ürünler</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-discount-mobile"
                          checked={filters.discount}
                          onCheckedChange={(checked) => setFilters({...filters, discount: checked as boolean})}
                        />
                        <Label htmlFor="filter-discount-mobile">İndirimli Ürünler</Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="mt-6 space-y-2">
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  Filtreleri Uygula
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    handleClearFilters();
                    setMobileFiltersOpen(false);
                  }}
                >
                  Filtreleri Temizle
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
