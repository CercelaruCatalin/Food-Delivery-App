"use client"
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import Loading from "../../../components/loading/loading";
import React from 'react';
import Header from "../../../components/header/header";
import { useSession } from 'next-auth/react';

export default function RestaurantsPage({ params }) {
  const resolvedParams = React.use(params);
  const { city, restaurantName, id } = resolvedParams;
  const restaurantId = id;
  const router = useRouter();
  const pathname = usePathname();

  const { data: session, status } = useSession();

  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentTime = new Date();


  useEffect(() => {
    const fetchCategories = async () => {
      try {

        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to load categories');
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error("Failed to load categories");
      }
    };

    const userType = session?.user?.userType;
    if(userType === 'courier'){
      router.push('/courier/dashboard');
    }

    fetchCategories();
  }, [session, status]);

  useEffect(() => {
    const loadRestaurants = async () => {
      if (!city) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/restaurants?city=${encodeURIComponent(city)}`);
        
        if (!response.ok) throw new Error("Failed to load restaurants");
        
        const data = await response.json();
        setRestaurants(data.restaurants || []);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        toast.error(error.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };
  
    loadRestaurants();
  }, [city]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  // Fix the mouse wheel scrolling function
  useEffect(() => {
    const scrollContainer = document.getElementById('categoryScrollContainer');
    
    // Handle mouse wheel scrolling
    const handleWheel = (e) => {
      if (scrollContainer) {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY * 2;
      }
    };

    if (scrollContainer) {
      // Add event listeners - make sure we're capturing the events
      scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
      
      return () => {
        scrollContainer.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);

   // Scroll buttons
   const scrollLeft = () => {
    const container = document.getElementById('categoryScrollContainer');
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('categoryScrollContainer');
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const clearFilters = () => setSelectedCategories([]);

  const [searchQuery, setSearchQuery] = useState("");

  const handleRestaurantSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  useEffect(() => {
    if (restaurants.length === 0) return;

    const isRestaurantOpen = (restaurant) => {
      const closesHour = parseInt(restaurant.closes.split(':')[0]);
      return currentTime.getHours() < closesHour;
    };

    let filtered = [...restaurants];
    
    // Apply search filter first
    if (searchQuery.trim()) {
      filtered = filtered.filter(restaurant =>
        restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Then apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(restaurant => 
        selectedCategories.some(category => 
          restaurant.categories?.includes(category)
        )
      );
    }
    
    // Sort restaurants: open first, closed last
    filtered = filtered.sort((a, b) => {
      const aIsOpen = isRestaurantOpen(a);
      const bIsOpen = isRestaurantOpen(b);
      
      if (aIsOpen && !bIsOpen) return -1;
      if (!aIsOpen && bIsOpen) return 1;
      return 0;
    });
    
    setFilteredRestaurants(filtered);
  }, [restaurants, selectedCategories, searchQuery]);

  if (isLoading || !resolvedParams || !filteredRestaurants) {
    return <Loading baseSize={8} mdSize={12} lgSize={16} borderWidth={3} />;
  }

  // Category icons mapping (using Heroicons)
  const categoryIcons = {
    "pizza": (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" strokeWidth="2">
        <path d="M12 21.5c-3.04 0 -5.952 -.714 -8.5 -1.983l8.5 -16.517l8.5 16.517a19.09 19.09 0 0 1 -8.5 1.983z"></path>
        <path d="M5.38 15.866a14.94 14.94 0 0 0 6.815 1.634a14.944 14.944 0 0 0 6.502 -1.479"></path>
        <path d="M13 11.01v-.01"></path>
        <path d="M11 14v-.01"></path>
      </svg>
    ),
    "burger": (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" strokeWidth="2">
        <path d="M4 15h16a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z"></path>
        <path d="M12 4c3.783 0 6.953 2.133 7.786 5h-15.572c.833 -2.867 4.003 -5 7.786 -5z"></path>
        <path d="M5 12h14"></path>
      </svg>
    ),
    "sushi": (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" strokeWidth="2">
        <path d="M16.69 7.44a6.973 6.973 0 0 0 -1.69 4.56c0 1.747 .64 3.345 1.699 4.571"></path>
        <path d="M2 9.504c7.715 8.647 14.75 10.265 20 2.498c-5.25 -7.761 -12.285 -6.142 -20 2.504"></path>
        <path d="M18 11v.01"></path>
        <path d="M11.5 10.5c-.667 1 -.667 2 0 3"></path>
      </svg>
    ),
    "pasta": (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" strokeWidth="2">
        <path d="M12 3c1.918 0 3.52 1.35 3.91 3.151a4 4 0 0 1 2.09 7.723l0 7.126h-12v-7.126a4 4 0 1 1 2.092 -7.723a4 4 0 0 1 3.908 -3.151z"></path>
        <path d="M6.161 17.009l11.839 -.009"></path>
      </svg>
    ),
    "dessert": (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" strokeWidth="2">
        <path d="M12 11l8 2c1.361 -.545 2 -1.248 2 -2v-3.8c0 -1.765 -4.479 -3.2 -10.002 -3.2c-5.522 0 -9.998 1.435 -9.998 3.2v2.8c0 1.766 4.478 4 10 4v-3z"></path>
        <path d="M12 14v3l8 2c1.362 -.547 2 -1.246 2 -2v-3c0 .754 -.638 1.453 -2 2l-8 -2z"></path>
        <path d="M2 17c0 1.766 4.476 3 9.998 3l.002 -3c-5.522 0 -10 -1.734 -10 -3.5v3.5z"></path>
        <path d="M2 10v4"></path>
        <path d="M22 10v4"></path>
      </svg>
    ),
    "hot dog": (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" strokeWidth="2">
        <path d="M5.5 5.5a2.5 2.5 0 0 0 -2.5 2.5c0 7.18 5.82 13 13 13a2.5 2.5 0 1 0 0 -5a8 8 0 0 1 -8 -8a2.5 2.5 0 0 0 -2.5 -2.5z"></path>
        <path d="M5.195 5.519l-1.243 -1.989a1 1 0 0 1 .848 -1.53h1.392a1 1 0 0 1 .848 1.53l-1.245 1.99"></path>
        <path d="M18.482 18.225l1.989 -1.243a1 1 0 0 1 1.53 .848v1.392a1 1 0 0 1 -1.53 .848l-1.991 -1.245"></path>
      </svg>
    ),
    "drinks": (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" strokeWidth="2">
        <path d="M10 5h4v-2a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v2z"></path>
        <path d="M14 3.5c0 1.626 .507 3.212 1.45 4.537l.05 .07a8.093 8.093 0 0 1 1.5 4.694v6.199a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2v-6.2c0 -1.682 .524 -3.322 1.5 -4.693l.05 -.07a7.823 7.823 0 0 0 1.45 -4.537"></path>
        <path d="M7 14.803a2.4 2.4 0 0 0 1 -.803a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 1 -.805"></path>
      </svg>
    ),
    "salad": (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" strokeWidth="2">
        <path d="M4 11h16a1 1 0 0 1 1 1v.5c0 1.5 -2.517 5.573 -4 6.5v1a1 1 0 0 1 -1 1h-8a1 1 0 0 1 -1 -1v-1c-1.687 -1.054 -4 -5 -4 -6.5v-.5a1 1 0 0 1 1 -1z"></path>
        <path d="M18.5 11c.351 -1.017 .426 -2.236 .5 -3.714v-1.286h-2.256c-2.83 0 -4.616 .804 -5.64 2.076"></path>
        <path d="M5.255 11.008a12.204 12.204 0 0 1 -.255 -2.008v-1h1.755c.98 0 1.801 .124 2.479 .35"></path>
        <path d="M8 8l1 -4l4 2.5"></path>
        <path d="M13 11v-.5a2.5 2.5 0 1 0 -5 0v.5"></path>
      </svg>
    ),
    "kebab": (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" strokeWidth="2">
        <path d="M19 8h-14a6 6 0 0 0 6 6h2a6 6 0 0 0 6 -5.775l0 -.225z"></path>
        <path d="M17 20a2 2 0 1 1 0 -4a2 2 0 0 1 0 4z"></path>
        <path d="M15 14l1 2"></path>
        <path d="M9 14l-3 6"></path>
        <path d="M15 18h-8"></path>
        <path d="M15 5v-1"></path>
        <path d="M12 5v-1"></path>
        <path d="M9 5v-1"></path>
      </svg>
    ),
    "noodles": (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" strokeWidth="2">
        <path d="M4 4c5.333 1.333 10.667 1.333 16 0"></path>
        <path d="M4 8h16"></path>
        <path d="M12 5v3"></path>
        <path d="M18 4.5v15.5"></path>
        <path d="M6 4.5v15.5"></path>
      </svg>
    ),
    "pastry": (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" strokeWidth="2">
        <path d="M5.628 11.283l5.644 -5.637c2.665 -2.663 5.924 -3.747 8.663 -1.205l.188 .181a2.987 2.987 0 0 1 0 4.228l-11.287 11.274a3 3 0 0 1 -4.089 .135l-.143 -.135c-2.728 -2.724 -1.704 -6.117 1.024 -8.841z"></path>
        <path d="M9.5 7.5l1.5 3.5"></path>
        <path d="M6.5 10.5l1.5 3.5"></path>
        <path d="M12.5 4.5l1.5 3.5"></path>
      </svg>
    ),
    "donuts": (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" strokeWidth="2">
            <path d="M8 3h8a2 2 0 0 1 2 2v1.82a5 5 0 0 0 .528 2.236l.944 1.888a5 5 0 0 1 .528 2.236v5.82a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-5.82a5 5 0 0 1 .528 -2.236l1.472 -2.944v-3a2 2 0 0 1 2 -2z"></path>
            <path d="M14 15m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
            <path d="M6 21a2 2 0 0 0 2 -2v-5.82a5 5 0 0 0 -.528 -2.236l-1.472 -2.944"></path>
            <path d="M11 7h2"></path>
        </svg>
      ),
    "default": (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    )
  };

  const getCategoryIcon = (categoryName) => {
    return categoryIcons[categoryName] || categoryIcons["default"];
  };

  return (
    <div className="container mx-auto px-4 md:px-16 py-8 mt-20">

      <Header searchRestaurants={handleRestaurantSearch} />

      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800">
          Restaurants in <span className="text-primary capitalize">{city}</span>
        </h1>
        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
          Choose from our selection of top-rated restaurants
        </p>
      </header>

      {/* Horizontal Scroll Filters */}
      <div className="mb-8">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Filter by Category</h2>
            {selectedCategories.length > 0 && (
              <button 
                onClick={clearFilters}
                className="text-primary text-sm font-medium hover:text-primaryhov flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
                Clear filters
              </button>
            )}
          </div>
          
          {/* positioning for scroll buttons */}
          <div className="relative group">
            {/* Left scroll button - fixed positioning */}
            <button 
              onClick={scrollLeft}
              className="absolute left-0 top-5 -translate-y-1/2 z-10 bg-white/90 hover:bg-primaryhov p-2 rounded-full shadow-md flex items-center justify-center"
              style={{ height: '34px', marginTop: '1px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            
            <div 
              id="categoryScrollContainer"
              className="flex overflow-x-auto pb-4 gap-2 scroll-smooth snap-x scrollbar-hide mx-10"
              style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.name)}
                  className={`py-2 px-4 rounded-full flex items-center transition-colors duration-200 whitespace-nowrap flex-shrink-0 snap-start ${
                    selectedCategories.includes(category.name)
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-primaryhov hover:text-white"
                  }`}
                >
                  <span className="mr-2">{getCategoryIcon(category.name)}</span>
                  {category.name}
                </button>
              ))}
            </div>
            
            {/* Right scroll button*/}
            <button 
              onClick={scrollRight}
              className="absolute right-0 top-5 -translate-y-1/2 z-10 bg-white/90 hover:bg-primaryhov p-2 rounded-full shadow-md flex items-center justify-center"
              style={{ height: '34px', marginTop: '1px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {filteredRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRestaurants.map((restaurant) => {
            const closesHour = parseInt(restaurant.closes.split(':')[0]);
            const isOpen = currentTime.getHours() < closesHour;

            return (
              <Link
                key={restaurant.id}
                href={`/${city}/${restaurant.name.toLowerCase().replace(/\s+/g, '-')}/${restaurant.id}/restaurant`}
                className="group block"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full group-hover:scale-105">
                  {/* Grayscale Image Container */}
                  <div className={`relative h-56 overflow-hidden ${!isOpen ? 'grayscale opacity-90' : ''}`}>
                    <Image
                      src={restaurant.image || "/placeholder-restaurant.png"}
                      alt={restaurant.name}
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-70"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center space-x-2">
                        <span className={`text-white text-xs font-medium px-2 py-1 rounded-full ${
                          isOpen ? 'bg-primary' : 'bg-red-500'
                        }`}>
                          {isOpen ? 'Open now' : 'Closed'}
                        </span>
                        <span className="bg-white/80 backdrop-blur-sm text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                          {restaurant.opens.slice(0, 5)} - {restaurant.closes.slice(0, 5)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                      {restaurant.name}
                    </h2>
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 mr-1 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      <address className="not-italic">
                        {restaurant.street_address}, {restaurant.postal_code}
                      </address>
                    </div>

                    {restaurant.categories?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {restaurant.categories.slice(0, 3).map((cat, index) => (
                          <span key={index} className="inline-flex items-center text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                            {cat}
                          </span>
                        ))}
                        {restaurant.categories.length > 3 && (
                          <span className="inline-flex items-center text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                            +{restaurant.categories.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                          </svg>
                          <span className="ml-1 text-sm font-medium">4.8</span>
                        </div>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-xs text-gray-500">30-45 min</span>
                      </div>
                      <div className="px-4 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                        View Menu
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          )}
        </div>
      ) : (
        <div className="text-center p-12 bg-gray-50 rounded-xl shadow-inner">
          <div className="mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <p className="text-gray-600 text-xl font-medium mb-4">
            {selectedCategories.length > 0 
              ? `No restaurants found for the selected categories in ${city}`
              : `No restaurants found in ${city}`
            }
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-2 bg-primary hover:bg-primaryhov text-white py-3 px-8 rounded-lg font-medium transition-colors duration-300 inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}